import WebSocket from 'ws';
import RSWebSocketMessage from './RSWebSocketMessage.js';

class RSWebSocket {
  constructor(client, address) {
    this.client = client;
    this.address = address;
    this.msg_id = 0;
    this.requests = {};
    this.reconnect_wait = 1000;
    this.connect();
  }

  connect() {
    const ws = this.wsc = new WebSocket(this.address, {});
    ws.on('error', console.error);
    ws.on('open', () => {
      console.log(`WebSocket connected`);
      this.reconnect_wait = 1000;
    });
    ws.on('close', (code, reason) => {
      console.log(`WebSocket disconnected (${code}), reconnect attempt in ${this.reconnect_wait/1000} seconds...`);
      setTimeout(() => this.connect(), this.reconnect_wait);
      this.reconnect_wait *= 2;
    });
    ws.on('message', (msg_raw, is_binary) => {
      const msg = RSWebSocketMessage.to_object(msg_raw);
      if(this.requests[msg.id]) {
        this.requests[msg.id].resolve(msg);
        delete this.requests[msg.id];
      } else {
        this.client.on_message(msg);
      }
    });
  }

  async request(msg) {
    msg.id = this.msg_id++;
    this.wsc.send(RSWebSocketMessage.from_object(msg));
    return new Promise((resolve, reject) => {
      this.requests[msg.id] = {
        resolve: resolve,
        reject: reject,
      };
    });
  }
};

export default RSWebSocket;
