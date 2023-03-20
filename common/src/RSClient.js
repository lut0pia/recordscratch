import RSLibrary from "./RSLibrary.js";
import RSWebSocket from "./RSWebSocket.js";

class RSClient {
  constructor() {
    this.ws = new RSWebSocket('ws://127.0.0.1');
    this.lib = new RSLibrary();
    this.current_user = null;
  }

  async handle_request(msg) {
    return await this.ws.request(msg);
  }
};

export default RSClient;
