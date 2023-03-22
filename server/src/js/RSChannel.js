export default class RSChannel {
  constructor(server, name) {
    this.server = server;
    this.name = name;
    this.connections = new Set();
    this.queue = [];
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
};
