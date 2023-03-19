import db from "../db.js"

export default {
  name: 'track_get',
  fields: {
    track_hash: true,
  },
  on_message: async (server, conn, msg) => {
    const tracks = await db.get_collection('tracks');
    const existing_track = await tracks.findOne({
      hash: msg.track_hash,
    });
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
