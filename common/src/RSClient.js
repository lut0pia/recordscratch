import fs from './RSFileSystem.js';
import os from 'os';
import RSLibrary from "./RSLibrary.js";
import RSUserRegistry from './RSUserRegistry.js';
import RSWebSocket from "./RSWebSocket.js";
import RSUserSettings from './RSUserSettings.js';
import RSTrack from './RSTrack.js';

let server_addresses = [
  'wss://recordscratch.lutopia.net',
];

if(typeof location == 'undefined' || location.hostname != 'recordscratch.lutopia.net') {
  server_addresses.unshift(
    'ws://127.0.0.1',
  );
}

export default class RSClient {
  constructor() {
    this.settings = new RSUserSettings();
    this.settings.load_from_file();
    this.ws = new RSWebSocket(this, server_addresses);
    this.lib = new RSLibrary();
    this.lib.load_from_file();
    this.users = new RSUserRegistry();
    this.server_diff_offset = 0;
    this.chat = [];
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
    await this.upload_user_properties();
    this.update_ui_state();
  }

  on_disconnection() {
    if(this.emit_notification) {
      this.user_log({
        type: 'error',
        text: `Disconnected from server!`,
      });
    }
    if(this.emit_state_update) {
      this.update_ui_state();
    }
  }

  async on_message(msg) {
    // Received a generic message not associated with a request
    switch(msg.type) {
      case 'channel_state':
        const previous_state = this.channel_state;
        this.channel_state = msg.state;
        if(previous_state && previous_state.name != this.channel_state.name) {
          this.chat = []; // We changed channel, wipe chat history
        }
        for(let post of this.channel_state.queue) {
          await this.conditional_fetch_user(post.user_id);
        }
        this.update_ui_state();
        break;
      case 'channel_message':
        await this.conditional_fetch_user(msg.user_id);
        const chat_msg = {
          user_id: msg.user_id,
          message: msg.message,
        };
        this.chat.push(chat_msg);
        this.update_ui_state();
        this.emit_chat_message(chat_msg)
        break;
      case 'user_property':
        if(this.users.get_user(msg.user_id)) {
          this.users.set_user_property(msg.user_id, msg.key, msg.value);
          this.update_ui_state();
        }
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

  async upload_user_properties() {
    for(let setting of Object.entries(RSUserSettings.descriptions)) {
      const key = setting[0];
      const value = this.settings.get_value(key);
      if(value && setting[1].shared) {
        await this.request({
          type:'user_set_property',
          key: key,
          value: value,
        });
      }
    }
    console.log('Uploaded user properties');
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

  is_track_on_disk(track_hash) {
    const track = this.lib.tracks_by_hash[track_hash];
    return track && track.file_path;
  }

  async save_track(track) {
    let track_buffer;
    const lib_track = this.lib.tracks_by_hash[track.hash];
    if(lib_track && lib_track.file_path) {
      this.user_log({
        type: 'log',
        text: `Track already in library: ${track.artist} - ${track.title}`,
      });
      return;
    }
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
    const sanitize_filename = s => {
      return s.replace('?', '')
        .replace('|', '_').replace(':', '')
        .replace('/', '-').replace('*', '-')
        .replace('<', '-').replace('>', '-')
        .replace('"', '').trim();
    };
    const dir_path = `${os.homedir()}/Music/RecordScratch/${sanitize_filename(track.artist)}/${sanitize_filename(track.album)}`;
    await fs.mkdir(dir_path, {recursive: true});
    const ext = track.filename.slice(track.filename.lastIndexOf("."));
    const file_path = `${dir_path}/${sanitize_filename(track.title)}${ext}`;
    await fs.writeFile(file_path, track_buffer);
    this.user_log({
      type: 'log',
      text: `Saved track: ${track.artist} - ${track.title}`,
    });
  }

  clear_library() {
    this.lib.clear();
  }

  async get_channels() {
    const channels = (await this.request({
      type: 'channel_list',
    })).channels;
    for(let channel of channels) {
      for(let post of channel.queue) {
        await this.conditional_fetch_user(post.user_id);
      }
    }
    return channels;
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

  async message_channel(message) {
    const result = await this.request({
      type: 'channel_message',
      message: message,
    });
    if(result.status == 'error') {
      this.user_log({
        type: 'error',
        text: `Failed to send message: ${result.text}`
      });
    }
  }

  async queue_post(track) {
    if(track.buffer && !track.hash) {
      const buffered_track = track;
      track = await RSTrack.from_buffer(track.buffer, track.filename);
      Object.assign(track, buffered_track);
    }

    const server_track = await this.request({
      type: 'track_get',
      track_hash: track.hash,
    });

    // If the track couldn't be found, upload it
    if(server_track.status == 'error') {
      const track_buffer = track.buffer || await fs.readFile(track.file_path);
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

  async set_setting(key, value) {
    const setting_desc = RSUserSettings.descriptions[key];
    if(!setting_desc) {
      return this.user_log({
        type: 'error',
        text: `Unknown setting name: ${key}`,
      });
    }
    if(setting_desc.regexp && !value.match(setting_desc.regexp)) {
      return this.user_log({
        type: 'error',
        text: `Invalid value for setting: ${key}`,
      });
    }
    this.settings.set_value(key, value);
    this.update_ui_state();
    if(setting_desc.shared) {
      const result = await this.request({
        type:'user_set_property',
        key: key,
        value: value,
      });
    }
  }

  get_setting_descriptions() {
    return RSUserSettings.descriptions;
  }

  async conditional_fetch_user(user_id) {
    if(!this.users.get_user(user_id)) {
      const result = await this.request({
        type: 'user_get',
        user_id: user_id,
      });
      if(result.status == 'success') {
        this.users.create_user(user_id, result.user);
      } else {
        // The user does not exist, create an empty user and forget about it
        this.users.create_user(user_id, {});
      }
    }
  }

  init_ui_state() {
    this.update_ui_state();
  }

  update_ui_state() {
    this.emit_state_update({
      is_browser: typeof window !== "undefined",
      connected: this.ws.is_connected(),
      user: this.user,
      users: this.users.users,
      channel: this.channel_state,
      chat: this.chat,
      settings: this.settings.values,
    });
  }

  user_log(log) {
    console.log(log.text);
    this.emit_notification(log)
  }

  static get_ipc_message_in_types(is_dev) {
    const message_types = [
      'init_ui_state',

      'get_server_time',
      'get_channels',
      'get_track_buffer',

      'get_tracks',
      'is_track_on_disk',
      'save_track',
      'clear_library',

      'join_channel',
      'message_channel',
      'queue_post',
      'cancel_post',

      'set_setting',
      'get_setting_descriptions',
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
      'chat_message',
    ];
    return message_types;
  }
};
