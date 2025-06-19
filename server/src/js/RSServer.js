import { RSUserRegistry } from 'recordscratch-common';
import RSChannel from './RSChannel.js';

import channel_join from './msg/channel_join.js';
import channel_leave from './msg/channel_leave.js';
import channel_list from './msg/channel_list.js';
import post_cancel from './msg/post_cancel.js';
import post_queue from './msg/post_queue.js';
import time_get from './msg/time_get.js';
import track_download from './msg/track_download.js';
import track_get from './msg/track_get.js';
import track_upload from './msg/track_upload.js'
import user_get from './msg/user_get.js';
import user_set_property from './msg/user_set_property.js';

const msg_types = [
  channel_join,
  channel_leave,
  channel_list,
  post_cancel,
  post_queue,
  time_get,
  track_download,
  track_get,
  track_upload,
  user_get,
  user_set_property,
];

export default class RSServer {
  constructor() {
    this.tracks = {};
    this.channels = {};
    this.connections = new Set();
    this.users = new RSUserRegistry();
    this.users.on_user_property_change = (user_id, key, value) => {
      this.broadcast({
        type: 'user_property',
        user_id: user_id,
        key: key,
        value: value,
      })
    };
    this.next_id = 0;
    setInterval(() => this.prune_tracks(), 60000);
  }

  on_connection(conn, request) {
    conn.id = this.get_next_id();
    this.connections.add(conn);
    this.users.create_user(conn.id);
    console.log(`Connection: ${conn.id} (${request.socket.remoteAddress})`);
  }

  on_disconnection(conn, code, reason) {
    if(conn.channel) {
      conn.channel.leave(conn);
    }
    this.users.remove_user(conn.id);
    this.connections.delete(conn);
    console.log(`Disconnection: ${conn.id} (${code}: ${reason})`);
  }

  on_message(conn, msg) {
    for(let msg_type of msg_types) {
      if(msg.type == msg_type.name) {
        if(msg_type.fields) {
          for(let field_name in msg_type.fields) {
            if(!msg[field_name]){
              return msg.reply({
                status: 'error',
                text: `Missing field for '${msg.type}' message: ${field_name}`,
              });
            }
          }
        }
        return msg_type.on_message(this, conn, msg);
      }
    }
    msg.reply({
      status: 'error',
      text: `Unknown message type: ${msg.type}`,
    });
  }

  get_channel(channel_name) {
    if(!this.channels[channel_name]) {
      this.channels[channel_name] = new RSChannel(this, channel_name);
    }
    return this.channels[channel_name];
  }

  get_track(track_hash) {
    return this.tracks[track_hash];
  }

  get_next_id() {
    return this.next_id++;
  }

  broadcast(msg) {
    this.connections.forEach(conn => conn.send_msg(msg));
  }

  // Removes all tracks no longer referenced in channels
  prune_tracks() {
    const used_track_hashes = new Set();
    for(let channel of Object.values(this.channels)) {
      for(let track_hash of channel.get_used_track_hashes()) {
        used_track_hashes.add(track_hash);
      }
    }

    for(let track of Object.values(this.tracks)) {
      if(!used_track_hashes.has(track.hash)) {
        delete this.tracks[track.hash];
        console.log(`Removed track: ${track.artist} - ${track.title} (${track.hash.substring(0, 8)})`);
      }
    }
  }
};
