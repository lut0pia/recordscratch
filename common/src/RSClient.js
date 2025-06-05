import fs from 'fs/promises';
import RSLibrary from "./RSLibrary.js";
import RSWebSocket from "./RSWebSocket.js";

class RSClient {
  constructor() {
    this.ws = new RSWebSocket(this, 'ws://127.0.0.1');
    this.lib = new RSLibrary();
    this.current_user = null;
  }

  async request(msg) {
    return await this.ws.request(msg);
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
    this.send_ui_state({
      channel: this.channel_state,
    });
  }

  static get_ipc_methods(is_dev) {
    const ipc_methods = [
      'get_channels',
      'get_track_buffer',
      'get_tracks',
      'join_channel',
      'queue_track',
    ];
    if(is_dev) {
      ipc_methods.push('request');
    }
    return ipc_methods;
  }
};

export default RSClient;
