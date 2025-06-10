import fs from 'fs/promises';
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
    await this.update_server_time_offset();
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

  async get_track_buffer(track_hash) {
    const lib_track = this.lib.tracks_by_hash[track_hash];
    if(lib_track) {
      return await fs.readFile(lib_track.file_path);
    }

    const track_download = await this.request({
      type: 'track_download',
      track_hash: track_hash,
    });

    if(track_download.status == 'success') {
      return track_download.track_buffer;
    } else {
      console.error(`Could not find track ${track_hash}: ${track_download.text}`);
      return null;
    }
  }

  get_tracks() {
    return this.lib.tracks;
  }

  async get_channels() {
    return (await this.request({
      type: 'channel_list',
    })).channels;
  }

  async join_channel(channel_name) {
    return await this.request({
      type: 'channel_join',
      channel_name: channel_name,
    });
  }

  async queue_track(track) {
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
      });

      if(upload_response.status == 'error') {
        console.error(`Could not upload track: ${upload_response.text}`);
        return;
      }
    }

    // The track should be available to the server, queue it
    const queue_response = await this.request({
      type: 'track_queue',
      track_hash: track.hash,
    });

    if(queue_response.status == 'error') {
      console.error(`Could not queue track: ${queue_response.text}`);
    } else {
      console.log(`Queued track: ${track.hash}`)
    }
  }

  update_ui_state() {
    this.emit_state_update({
      channel: this.channel_state,
    });
  }

  static get_ipc_message_in_types(is_dev) {
    const message_types = [
      'get_server_time',
      'get_channels',
      'get_track_buffer',
      'get_tracks',
      'join_channel',
      'queue_track',
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
