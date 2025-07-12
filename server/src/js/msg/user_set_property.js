import { RSUserSettings } from "recordscratch-common";

export default {
  name: 'user_set_property',
  fields: {
    key: true,
    value: true,
  },
  on_message: async (server, conn, msg) => {
    const property = RSUserSettings.descriptions[msg.key];
    if(!property) {
      return msg.reply({
        status: 'error',
        text: 'Trying to set unknown property',
      });
    }
    if(!property.shared) {
      return msg.reply({
        status: 'error',
        text: 'Trying to set private property',
      });
    }
    if(property.regexp && !msg.value.match(property.regexp)) {
      return msg.reply({
        status: 'error',
        text: 'Invalid property value',
      });
    }
    server.users.set_user_property(conn.id, msg.key, msg.value);
    await msg.reply({
      status: 'success',
    });
  },
};
