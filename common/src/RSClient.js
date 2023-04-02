import RSLibrary from "./RSLibrary.js";
import RSWebSocket from "./RSWebSocket.js";

class RSClient {
  constructor() {
    this.ws = new RSWebSocket('ws://127.0.0.1');
    this.lib = new RSLibrary();
    this.current_user = null;
  }

  async request(msg) {
    return await this.ws.request(msg);
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

  update_ui_state() {
    this.send_ui_state({
      current_channel_name: this.current_channel_name,
    });
  }

  static get_ipc_methods(is_dev) {
    const ipc_methods = [
      'get_channels',
      'get_tracks',
      'join_channel',
    ];
    if(is_dev) {
      ipc_methods.push('request');
    }
    return ipc_methods;
  }
};

export default RSClient;
