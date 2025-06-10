export default class RSChannel {
  constructor(server, name) {
    this.server = server;
    this.name = name;
    this.connections = new Set();
    this.queue = [];
    console.log(`#${this.name}: Created`);
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
        user_id: p.conn.id,
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

  get_post(post_id) {
    return this.queue.find(post => post.id == post_id);
  }

  queue_post(conn, track) {
    const post = {
      id: this.server.get_next_id(),
      conn: conn,
      track: track,
    };
    this.queue.push(post);
    this.compute_queue_timings();
    this.broadcast_state();
    console.log(`#${this.name}: Queued track ${track.artist} - ${track.title} (${track.hash.substring(0, 8)})`);
    return post;
  }

  cancel_post(post) {
    const index = this.queue.indexOf(post);
    this.queue.splice(index, 1);
    this.compute_queue_timings();
    this.broadcast_state();
    console.log(`#${this.name}: Cancelled post ${post.track.artist} - ${post.track.title} (${post.track.hash.substring(0, 8)})`);
  }

  compute_queue_timings() {
    let next_start_time = 0;
    for(let post of this.queue) {
      // Posts with no start time are new (therefore also in the future)
      if(post.start_time > Date.now() || !post.start_time) {
        // Posts cannot happen before the end of the previous post
        post.start_time = Math.max(Date.now(), next_start_time);
      }
      // Start time is in milliseconds while track duration is in seconds
      next_start_time = post.start_time + post.track.duration * 1000;
    }
  }
};
