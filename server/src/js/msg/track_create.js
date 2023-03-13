'use strict';

const db = require('../db.js');

module.exports = {
  name: 'track_create',
  fields: {
    track_hash: true,
    track_magnet: true,
    track_artist: true,
    track_album: true,
    track_title: true,
    track_duration: true,
  },
  on_message: async (conn, msg) => {
    const tracks = await db.get_collection('tracks');
    const existing_track = await tracks.findOne({
      hash: msg.track_hash,
    });
    if(existing_track) {
      await msg.reply({
        status: 'error',
        text: `Track already exists with hash: ${msg.track_hash}`,
        track: existing_track,
      });
    } else {
      await tracks.insertOne({
        hash: msg.track_hash,
        magnet: msg.track_magnet,
        artist: msg.track_artist,
        album: msg.track_album,
        title: msg.track_title,
      });
      await msg.reply({
        status: 'success',
      });
    }
  },
};
