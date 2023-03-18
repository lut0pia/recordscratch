const ws = require('ws');

class RSWebSocket {
  constructor(address) {
    this.msg_id = 0;
    this.requests = {};
    const wsc = this.wsc = new ws.WebSocket(address, {});
    wsc.on('error', console.error);
    wsc.on('message', (msg_raw, is_binary) => {
      const msg = JSON.parse(msg_raw);
      if(this.requests[msg.id]) {
        this.requests[msg.id].resolve(msg);
        delete this.requests[msg.id];
      }
    });
  }

  async request(msg) {
    msg.id = this.msg_id++;
    this.wsc.send(JSON.stringify(msg));
    return new Promise((resolve, reject) => {
      this.requests[msg.id] = {
        resolve: resolve,
        reject: reject,
      };
    });
  }
};

export default RSWebSocket;
