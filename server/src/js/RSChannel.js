export default class RSChannel {
  constructor(server, name) {
    this.server = server;
    this.name = name;
    this.connections = new Set();
    this.queue = [];
    console.log(`#${this.name}: Created`);
  }

  deconstructor() {
    delete this.server.channels[this.name];
    console.log(`#${this.name}: Removed`);
  }

  is_public() {
    return !this.name.includes(':');
  }

  join(conn) {
    if(conn.channel) {
      conn.channel.leave(conn);
    }
    this.connections.add(conn);
    conn.channel = this;
    this.broadcast_state();
    console.log(`#${this.name}: ${conn.id} joined`);
  }

  leave(conn) {
    this.connections.delete(conn);
    delete conn.channel;
    this.queue = this.queue.filter(p => p.start_time < Date.now() || p.conn != conn);
    this.update_queue();
    console.log(`#${this.name}: ${conn.id} left`);

    if(this.connections.size == 0) {
      this.deconstructor(); // Remove empty channels
    }
  }

  update_queue() {
    this.remove_old_posts();
    this.enforce_queue_ordering();
    this.compute_queue_timings();
    this.broadcast_state();
  }

  broadcast_state() {
    this.broadcast({
      type: 'channel_state',
      state: this.to_client_data(),
    });
  }

  broadcast(msg) {
    this.connections.forEach(conn => conn.send_msg(msg));
  }

  to_client_data() {
    const no_buffer_track = track => {
      const nb_track = Object.assign({}, track);
      delete nb_track.buffer;
      return nb_track;
    };
    return {
      name: this.name,
      user_count: this.connections.size,
      queue: this.queue.map(p => ({
        id: p.id,
        user_id: p.conn.id,
        start_time: p.start_time,
        track: no_buffer_track(p.track),
      })),
    };
  }

  get_post(post_id) {
    return this.queue.find(post => post.id == post_id);
  }

  get_used_track_hashes() {
    return new Set(this.queue.map(p => p.track.hash));
  }

  queue_post(conn, track) {
    const post = {
      id: this.server.get_next_id(),
      conn: conn,
      track: track,
    };
    this.queue.push(post);
    this.update_queue();
    console.log(`#${this.name}: Queued track ${track.artist} - ${track.title} (${track.hash.substring(0, 8)})`);
    return post;
  }

  cancel_post(post) {
    const index = this.queue.indexOf(post);
    this.queue.splice(index, 1);
    this.update_queue();
    console.log(`#${this.name}: Cancelled post ${post.track.artist} - ${post.track.title} (${post.track.hash.substring(0, 8)})`);
  }

  remove_old_posts() {
    const cutoff_time = Date.now() - 30*60*1000; // Half an hour ago
    this.queue = this.queue.filter(p => !p.start_time || p.start_time + p.track.duration*1000 > cutoff_time);
  }

  enforce_queue_ordering() {
    const past_index = this.queue.findIndex(p => !p.start_time || p.start_time > Date.now());
    const past_queue = this.queue.slice(0, past_index);
    const future_queue = this.queue.slice(past_index);

    const per_user = {};
    const get_per_user = c => {
      if(!per_user[c.id]) {
        per_user[c.id] = {
          conn: c,
          air_time: 0,
          queue: [],
        };
      }
      return per_user[c.id];
    }
    for(let p of past_queue) {
      get_per_user(p.conn).air_time += p.track.duration;
    }
    for(let p of future_queue) {
      get_per_user(p.conn).queue.push(p);
    }

    const new_future_queue = [];
    while(true) {
      // Find the user with min air time that still has posts left
      const next_user = Object.values(per_user).reduce(
        (p, c) => c.queue.length > 0 && (!p || p.air_time > c.air_time) ? c : p, null);
      if(!next_user) {
        break;
      }
      const next_post = next_user.queue.shift();
      next_user.air_time += next_post.track.duration;
      new_future_queue.push(next_post);
    }

    this.queue = past_queue.concat(new_future_queue);
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
