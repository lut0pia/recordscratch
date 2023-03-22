export default {
  name: 'channel_leave',
  on_message: async (server, conn, msg) => {
    if(!conn.channel) {
      return await msg.reply({
        status: 'error',
        text: 'No channel to leave',
      });
    }
    conn.channel.leave(conn);
    await msg.reply({
      status: 'success',
    });
  },
};
