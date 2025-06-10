export default {
  name: 'post_cancel',
  fields: {
    post_id: true,
  },
  on_message: async (server, conn, msg) => {
    if(!conn.channel) {
      return await msg.reply({
        status: 'error',
        text: `No current channel to cancel post`,
      });
    }

    const post = conn.channel.get_post(msg.post_id);
    if(!post) {
      return await msg.reply({
        status: 'error',
        text: `No post with ID: ${msg.post_id}`,
      });
    }

    if(post.conn != conn) {
      return await msg.reply({
        status: 'error',
        text: `Post is not user's to cancel: ${msg.post_id}`,
      });
    }

    if(post.start_time < Date.now()) {
      return await msg.reply({
        status: 'error',
        text: `Post is already in the past`,
      });
    }

    conn.channel.cancel_post(post);
    await msg.reply({
      status: 'success',
    });
  },
};
