export default {
  name: 'user_get',
  fields: {},
  on_message: async (server, conn, msg) => {
    await msg.reply({
      status: 'success',
      user: {
        id: conn.id,
      },
    });
  },
};
