import WebSocket from 'ws';
import RSWebSocketMessage from './RSWebSocketMessage.js';

class RSWebSocket {
  constructor(client, addresses) {
    this.client = client;
    this.addresses = addresses;
    this.address_offset = 0;
    this.msg_id = 0;
    this.requests = {};
    this.reconnect_wait = 100;
    this.connect();
  }

  get_address() {
    return this.addresses[this.address_offset];
  }

  connect() {
    const ws = this.wsc = new WebSocket(this.get_address(), {});
    ws.on('error', (error) =>{
      console.error(error);
      this.address_offset = (this.address_offset + 1) % this.addresses.length;
    });
    ws.on('open', () => {
      console.log(`WebSocket connected to ${this.get_address()}`);
      this.reconnect_wait = 1000;
      if(this.client.on_connection) {
        this.client.on_connection();
      }
    });
    ws.on('close', (code, reason) => {
      console.log(`WebSocket disconnected (${code}), reconnect attempt in ${this.reconnect_wait/1000} seconds...`);
      setTimeout(() => this.connect(), this.reconnect_wait);
      this.reconnect_wait *= 2;
      if(this.client.on_disconnection) {
        this.client.on_disconnection();
      }
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
