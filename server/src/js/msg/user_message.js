export default {
  name: 'user_message',
  fields: {
    user_id: true,
    message: true,
  },
  on_message: async (server, conn, msg) => {
    const other_conn = this.user_id_to_conn[msg.user_id];
    if(!other_conn) {
      return await msg.reply({
        status: 'error',
        text: `Could not find user with id: ${msg.user_id}`,
      });
    }
    other_conn.send_msg({
      type: 'user_message',
      user_id: conn.id,
      message: msg.message,
    });
    await msg.reply({
      status: 'success',
    });
  },
};
