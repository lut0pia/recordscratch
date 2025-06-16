import fs from 'fs/promises';
import os from 'os';
import RSLibrary from "./RSLibrary.js";
import RSWebSocket from "./RSWebSocket.js";

const server_addresses = [
  'ws://127.0.0.1:18535',
  'ws://127.0.0.1',
  'wss://recordscratch.lutopia.net',
];

export default class RSClient {
  constructor() {
    this.ws = new RSWebSocket(this, server_addresses);
    this.lib = new RSLibrary();
    this.lib.load_from_file();
    this.current_user = null;
    this.server_diff_offset = 0;
    setInterval(async () => {
      this.update_server_time_offset();
      this.lib.save_to_file();
    }, 60000);
  }

  async request(msg) {
    return await this.ws.request(msg);
  }

  async on_connection() {
    const user_response = await this.ws.request({type: 'user_get'});
    this.user = user_response.user;
    await this.update_server_time_offset();
  }

  on_disconnection() {
    if(this.emit_notification) {
      this.user_log({
        type: 'error',
        text: `Disconnected from server!`,
      });
    }
  }

  on_message(msg) {
    // Received a generic message not associated with a request
    switch(msg.type) {
      case 'channel_state':
        this.channel_state = msg.state;
        this.update_ui_state();
        break;
    }
  }

  async update_server_time_offset() {
    const before = Date.now();
    const server_time = await this.ws.request({
      type: 'time_get',
    });
    const round_trip_time = Date.now() - before;
    const one_way_time = round_trip_time / 2;
    this.server_diff_offset = (server_time.time + one_way_time) - Date.now();
    console.log(`Server time offset: ${this.server_diff_offset}ms (ping: ${round_trip_time}ms)`);
  }

  get_server_time() {
    return Date.now() + this.server_diff_offset;
  }

  async get_track_buffer(track) {
    const lib_track = this.lib.tracks_by_hash[track.hash];
    if(lib_track) {
      if(lib_track.buffer) {
        return lib_track.buffer;
      } else {
        return await fs.readFile(lib_track.file_path);
      }
    }

    const track_download = await this.request({
      type: 'track_download',
      track_hash: track.hash,
    });

    if(track_download.status == 'success') {
      return track_download.track.buffer;
    } else {
      this.user_log({
        type: 'error',
        text: `Could not find track ${track.hash}: ${track_download.text}`,
      });
      return null;
    }
  }

  get_tracks() {
    return this.lib.tracks;
  }

  async save_track(track) {
    let track_buffer;
    const lib_track = this.lib.tracks_by_hash[track.hash];
    if(lib_track && lib_track.buffer) {
      track_buffer = lib_track.buffer;
    }
    if(!track_buffer) {
      const track_download = await this.request({
        type: 'track_download',
        track_hash: track.hash,
      });

      if(track_download.status == 'success') {
        track_buffer = track_download.track.buffer;
      }
    }
    if(!track || !track_buffer) {
      this.user_log({
        type: 'error',
        text: `Could not save track: ${track.artist} - ${track.title}`,
      });
      return;
    }
    const dir_path = `${os.homedir()}/Music/RecordScratch/${track.artist}/${track.album}`;
    await fs.mkdir(dir_path, {recursive: true});
    const file_path = `${dir_path}/${track.title}${track.ext}`;
    await fs.writeFile(file_path, track_buffer);
    this.user_log({
      type: 'log',
      text: `Saved track: ${track.artist} - ${track.title}`,
    });
  }

  async get_channels() {
    return (await this.request({
      type: 'channel_list',
    })).channels;
  }

  async join_channel(channel_name) {
    const result = await this.request({
      type: 'channel_join',
      channel_name: channel_name,
    });
    if(result.status == 'success') {
      this.user_log({
        type: 'log',
        text: `Joined channel #${channel_name}`,
      });
    } else {
      this.user_log({
        type: 'error',
        text: `Failed to join channel #${channel_name}: ${result.text}`
      })
    }
    return result;
  }

  async queue_post(track) {
    const server_track = await this.request({
      type: 'track_get',
      track_hash: track.hash,
    });

    // If the track couldn't be found, upload it
    if(server_track.status == 'error') {
      const track_buffer = await fs.readFile(track.file_path);
      const upload_response = await this.request({
        type: 'track_upload',
        track_buffer: track_buffer,
        track_filename: track.filename,
      });

      if(upload_response.status == 'error') {
        this.user_log({
          type: 'error',
          text: `Could not upload track: ${upload_response.text}`,
        });
        return;
      }
    }

    // The track should be available to the server, queue it
    const queue_response = await this.request({
      type: 'post_queue',
      track_hash: track.hash,
    });

    if(queue_response.status == 'error') {
      this.user_log({
        type: 'error',
        text: `Could not queue track: ${queue_response.text}`,
      });
    } else {
      this.user_log({
        type: 'log',
        text: `Queued track: ${track.artist} - ${track.title}`,
      });
    }
  }

  async cancel_post(post) {
    const cancel_response = await this.request({
      type: 'post_cancel',
      post_id: post.id,
    });
    if(cancel_response.status == 'error') {
      this.user_log({
        type: 'error',
        text: `Could not cancel post: ${cancel_response.text}`,
      });
    } else {
      this.user_log({
        type: 'log',
        text: `Cancelled post: ${post.track.artist} - ${post.track.title}`,
      });
    }
  }

  update_ui_state() {
    this.emit_state_update({
      user: this.user,
      channel: this.channel_state,
    });
  }
  
  user_log(log) {
    console.log(log.text);
    this.emit_notification(log)
  }

  static get_ipc_message_in_types(is_dev) {
    const message_types = [
      'get_server_time',
      'get_channels',
      'get_track_buffer',
      'get_tracks',
      'save_track',
      'join_channel',
      'queue_post',
      'cancel_post',
    ];
    if(is_dev) {
      message_types.push('request');
    }
    return message_types;
  }

  static get_ipc_message_out_types() {
    const message_types = [
      'state_update',
      'notification',
      'play'
    ];
    return message_types;
  }
};
