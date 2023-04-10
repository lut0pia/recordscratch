export default {
  name: 'track_queue',
  fields: {
    track_hash: true,
  },
  on_message: async (server, conn, msg) => {
    if(!conn.channel) {
      return await msg.reply({
        status: 'error',
        text: `No current channel to queue track`,
      });
    }

    const track = server.tracks[msg.track_hash];
    if(!track) {
      return await msg.reply({
        status: 'error',
        text: `Cannot find track with hash ${msg.track_hash}`,
      });
    }

    conn.channel.queue_track(conn, track);
    await msg.reply({
      status: 'success',
    });
  },
};
