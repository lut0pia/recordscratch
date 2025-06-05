export default {
  name: 'track_download',
  fields: {
    track_hash: true,
  },
  on_message: async (server, conn, msg) => {
    const track = server.tracks[msg.track_hash];
    if(track) {
      await msg.reply({
        status: 'success',
        track_buffer: track.buffer,
      });
    } else {
      await msg.reply({
        status: 'error',
        text: `Cannot find track with hash: ${msg.track_hash}`,
      });
    }
  },
};
