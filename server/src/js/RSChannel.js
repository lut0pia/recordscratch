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
  }

  leave(conn) {
    this.connections.delete(conn);
    delete conn.channel;
  }

  to_client_data() {
    return {
      name: this.name,
      user_count: this.connections.size,
      current_post: this.current_post,
    };
  }
};
