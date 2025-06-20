export default {
  name: 'channel_message',
  fields: {
    message: true,
  },
  on_message: async (server, conn, msg) => {
    const channel = conn.channel;
    if(!channel) {
      return await msg.reply({
        status: 'error',
        text: 'No channel to message to',
      });
    }
    channel.broadcast({
      type: 'channel_message',
      user_id: conn.id,
      message: msg.message,
    });
    await msg.reply({
      status: 'success',
    });
  },
};
