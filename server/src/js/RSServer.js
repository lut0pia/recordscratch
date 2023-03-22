import { RSTrack } from 'recordscratch-common';
import RSChannel from './RSChannel.js';

import channel_join from './msg/channel_join.js';
import channel_leave from './msg/channel_leave.js';
import track_get from './msg/track_get.js';
import user_sign_in from './msg/user_sign_in.js';
import user_sign_out from './msg/user_sign_out.js';
import user_sign_up from './msg/user_sign_up.js';

const msg_types = [
  channel_join,
  channel_leave,
  track_get,
  user_sign_in,
  user_sign_out,
  user_sign_up,
];

export default class RSServer {
  constructor() {
    this.tracks = {};
    this.channels = {};
    this.connections = new Set();
    this.next_conn_id = 0;
  }

  on_connection(conn, request) {
    conn.id = this.next_conn_id++;
    this.connections.add(conn);
    console.log(`Connection: ${conn.id} (${request.socket.remoteAddress})`);
  }

  on_disconnection(conn, code, reason) {
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
                type: 'error',
                text: `Missing field for '${msg.type}' message: ${field_name}`,
              });
            }
          }
        }
        return msg_type.on_message(this, conn, msg);
      }
    }
    msg.reply({
      type: 'error',
      text: `Unknown message type: ${msg.type}`,
    });
  }

  on_binary_message(conn, buffer) {
    const track_hash = RSTrack.get_hash_from_buffer(buffer);
    let track = this.tracks[track_hash];
    if(!track) {
      track = RSTrack.from_buffer(buffer);
      track.buffer = buffer;
      this.tracks[track_hash] = track;
      conn.send_msg({
        type: 'track_upload',
        status: 'success',
      });
    } else {
      conn.send_msg({
        type: 'track_upload',
        status: 'error',
        text: 'Track with same hash already exists',
      })
    }
  }

  get_channel(channel_name) {
    if(!this.channels[channel_name]) {
      this.channels[channel_name] = new RSChannel(this, channel_name);
    }
    return this.channels[channel_name];
  }
};
