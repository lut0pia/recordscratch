export default class RSChannel {
  constructor(server, name) {
    this.server = server;
    this.name = name;
    this.connections = new Set();
    this.queue = [];
    this.current_post = null;
  }

  join(conn) {
    if(conn.channel) {
      conn.channel.leave(conn);
    }
    this.connections.add(conn);
    conn.channel = this;
    this.broadcast_state();
  }

  leave(conn) {
    this.connections.delete(conn);
    delete conn.channel;
    this.broadcast_state();
  }

  broadcast_state() {
    const msg = {
      type: 'channel_state',
      state: this.to_client_data(),
    };
    this.connections.forEach(conn => conn.send_msg(msg));
  }

  to_client_data() {
    return {
      name: this.name,
      user_count: this.connections.size,
      current_post: this.current_post,
    };
  }
};
