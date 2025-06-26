import WebSocket from 'isomorphic-ws';
import RSWebSocketMessage from './RSWebSocketMessage.js';

export default class RSWebSocket {
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
    const address = this.get_address();
    const ws = this.wsc = new WebSocket(address);
    ws.binaryType = "arraybuffer";
    ws.onerror = (e) => {
      this.address_offset = (this.address_offset + 1) % this.addresses.length;
    };
    ws.onopen = () => {
      console.log(`WebSocket connected to ${address}`);
      this.reconnect_wait = 1000;
      if(this.client.on_connection) {
        this.client.on_connection();
      }
    };
    ws.onclose = (e) => {
      console.log(`WebSocket disconnected from ${address}, reconnect attempt in ${this.reconnect_wait/1000} seconds...`);
      setTimeout(() => this.connect(), this.reconnect_wait);
      this.reconnect_wait *= 2;
      if(this.client.on_disconnection) {
        this.client.on_disconnection();
      }
    };
    ws.onmessage = (e) => {
      const msg = RSWebSocketMessage.to_object(e.data);
      if(this.requests[msg.id]) {
        this.requests[msg.id].resolve(msg);
        delete this.requests[msg.id];
      } else {
        this.client.on_message(msg);
      }
    };
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
