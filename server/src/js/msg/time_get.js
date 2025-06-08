export default {
  name: 'time_get',
  fields: {},
  on_message: async (server, conn, msg) => {
    await msg.reply({
      status: 'success',
      time: Date.now(),
    });
  },
};
