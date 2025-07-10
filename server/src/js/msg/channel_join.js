import RSChannel from '../RSChannel.js';

export default {
  name: 'channel_join',
  fields: {
    channel_name: true,
  },
  on_message: async (server, conn, msg) => {
    const channel_name = msg.channel_name.toLowerCase();
    if(!channel_name.match(RSChannel.name_regex)) {
      return await msg.reply({
        status: 'error',
        text: `Invalid channel name`,
      });
    }
    const channel = server.get_channel(channel_name);
    if(conn.channel == channel) {
      return await msg.reply({
        status: 'error',
        text: `Already in channel`,
      });
    }
    channel.join(conn);
    await msg.reply({
      status: 'success',
    });
  },
};
