export default {
  name: 'channel_list',
  on_message: async (server, conn, msg) => {
    const channels = Object.values(server.channels);
    const public_channels = channels.filter(c => c.is_public());
    await msg.reply({
      status: 'success',
      channels: public_channels.map(c => c.to_client_data()),
    });
  },
};
