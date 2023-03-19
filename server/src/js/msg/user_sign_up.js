import db from "../db.js"
import bcrypt from 'bcrypt'

export default {
  name: 'user_sign_up',
  fields: {
    user_name: true,
    user_email: true,
    user_password: true,
  },
  on_message: async (server, conn, msg) => {
    const users = await db.get_collection('users');
    const existing_user = await users.findOne({
      email: msg.user_email,
    });
    if(existing_user) {
      await msg.reply({
        status: 'error',
        text: `User already exists with email: ${msg.user_email}`,
      });
    } else {
      const new_user = await users.insertOne({
        name: msg.user_name,
        email: msg.user_email,
        password: await bcrypt.hash(msg.user_password, 10),
      });
      await msg.reply({
        status: 'success',
      });
    }
  },
};
