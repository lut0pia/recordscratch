export default {
  name: 'track_get',
  fields: {
    track_hash: true,
  },
  on_message: async (server, conn, msg) => {
    const existing_track = server.get_track(msg.track_hash)
    if(existing_track) {
      await msg.reply({
        status: 'success',
        track: existing_track,
      });
    } else {
      await msg.reply({
        status: 'error',
        text: `Could not find track with hash: ${msg.track_hash}`,
      });
    }
  },
};
