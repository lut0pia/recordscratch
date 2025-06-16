import { RSTrack } from 'recordscratch-common';

export default {
  name: 'track_upload',
  fields: {
    track_buffer: true,
    track_filename: true,
  },
  on_message: async (server, conn, msg) => {
    const track_hash = RSTrack.get_hash_from_buffer(msg.track_buffer);
    let track = server.tracks[track_hash];
    if(track) {
      msg.reply({
        status: 'error',
        text: 'Track with same hash already exists',
      });
      return;
    }

    track = await RSTrack.from_buffer(msg.track_buffer, msg.track_filename);
    track.buffer = msg.track_buffer;
    server.tracks[track_hash] = track;
    console.log(`Added track: ${track.artist} - ${track.title} (${track_hash.substring(0, 8)})`);
    msg.reply({
      status: 'success',
    });
  },
};
