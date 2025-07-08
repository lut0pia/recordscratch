import { RSClient } from 'recordscratch-common'

// Create recordscratch client
const client = new RSClient();
const ipc_message_in_types = RSClient.get_ipc_message_in_types(true);
const ipc_message_out_types = RSClient.get_ipc_message_out_types();
global.rs = {};

// Prepare for handling requests to the client
for(let ipc_message of ipc_message_in_types) {
  rs[ipc_message] = async (...args) => {
    let result = RSClient.prototype[ipc_message].apply(client, args);
    if(result instanceof Promise) {
      result = await result;
    }
    return result;
  }
}

// Prepare for handling requests from the client
for(let ipc_message_type of ipc_message_out_types) {
  let callbacks = [];
  rs[`on_${ipc_message_type}`] = f => callbacks.push(f);
  RSClient.prototype['emit_'+ipc_message_type] = (...args) => {
    callbacks.forEach(f => f(null, ...args));
  }
}
