export default {
  name: 'channel_join',
  fields: {
    channel_name: true,
  },
  on_message: async (server, conn, msg) => {
    const channel = server.get_channel(msg.channel_name);
    channel.join(conn);
    await msg.reply({
      status: 'success',
    });
  },
};
