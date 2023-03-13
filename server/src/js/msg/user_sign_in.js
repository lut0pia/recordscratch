'use strict';

const db = require('../db.js');
const bcrypt = require('bcrypt');

module.exports = {
  name: 'user_sign_in',
  fields: {
    user_email: true,
    user_password: true,
  },
  on_message: async (conn, msg) => {
    if(conn.user_id) {
      await msg.reply({
        status: 'error',
        text: `Already signed in`,
      });
    }
    const users = await db.get_collection('users');
    const user = await users.findOne({
      email: msg.user_email,
    });
    if(user) {
      const is_password_valid = await bcrypt.compare(msg.user_password, user.password);
      if(is_password_valid) {
        conn.user_id = user._id;
        await msg.reply({
          status: 'success',
        });
      } else {
        await msg.reply({
          status: 'error',
          text: `Wrong password`,
        });
      }
    } else {
      await msg.reply({
        status: 'error',
        text: `User does not exist with email: ${msg.user_email}`,
      });
    }
  },
};
