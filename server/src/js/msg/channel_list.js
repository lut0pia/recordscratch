export default {
  name: 'channel_list',
  on_message: async (server, conn, msg) => {
    await msg.reply({
      status: 'success',
      channels: Object.values(server.channels).map(c => c.to_client_data()),
    });
  },
};
