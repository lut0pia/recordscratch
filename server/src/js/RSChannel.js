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
      queue: this.queue.map(p => ({
        id: p.id,
        start_time: p.start_time,
        track: {
          title: p.track.title,
          artist: p.track.artist,
          duration: p.track.duration,
          hash: p.track.hash,
        },
      })),
    };
  }

  queue_track(conn, track) {
    this.queue.push({
      id: this.server.get_next_id(),
      conn: conn,
      start_time: Date.now(),
      track: track,
    });
    this.compute_queue_timings();
    this.broadcast_state();
    console.log(`#${this.name}: Queued track ${track.artist} - ${track.title} (${track.hash.substring(0, 8)})`);
  }

  compute_queue_timings() {
    let next_start_time = 0;
    for(let post of this.queue) {
      if(next_start_time > 0) {
        // Post cannot happen before the end of the previous post
        // But it can happen later if queue was empty for a while
        post.start_time = Math.max(post.start_time, next_start_time);
      }
      // Start time is in milliseconds while track duration is in seconds
      next_start_time = post.start_time + post.track.duration * 1000;
    }
  }
};
