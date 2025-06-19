export default {
  name: 'user_get',
  fields: {},
  on_message: async (server, conn, msg) => {
    let user_id = conn.id
    if(msg.user_id !== undefined) {
      user_id = msg.user_id;
    }
    const user = server.users.get_user(user_id);
    if(user) {
      await msg.reply({
        status: 'success',
        user: user,
      });
    } else {
      await msg.reply({
        status: 'error',
        text: `Could not find user with id: ${user_id}`,
      });
    }
  },
};
