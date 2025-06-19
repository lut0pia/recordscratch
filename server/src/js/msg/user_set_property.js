import { RSUserRegistry } from "recordscratch-common";

export default {
  name: 'user_set_property',
  fields: {
    key: true,
    value: true,
  },
  on_message: async (server, conn, msg) => {
    const property = RSUserRegistry.user_properties[msg.key];
    if(!property) {
      msg.reply({
        status: 'error',
        text: 'Trying to set unknown property',
      });
      return;
    }
    if(property instanceof Function && !property(msg.value)) {
      msg.reply({
        status: 'error',
        text: 'Invalid property valid',
      });
      return;
    }
    server.users.set_user_property(conn.id, msg.key, msg.value);
    await msg.reply({
      status: 'success',
    });
  },
};
