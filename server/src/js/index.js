import { WebSocketServer } from 'ws'
import RSServer from './RSServer.js';
import config from './config.js';
import { RSWebSocketMessage }  from 'recordscratch-common';

const server = new RSServer();
process.title = 'recordscratch-server';

console.log(`Creating WS server on port ${config.port}`);
const wss = new WebSocketServer({
  port: config.port,
});
wss.on('connection', (conn, request) => {
  conn.send_msg = (msg) => {
    conn.send(RSWebSocketMessage.from_object(msg));
  };
  server.on_connection(conn, request);
  conn.on('message', async (msg_raw, is_binary) => {
    const msg = RSWebSocketMessage.to_object(msg_raw);
    msg.reply = (msg_reply) => {
      msg_reply.id = msg.id;
      conn.send_msg(msg_reply);
    };
    server.on_message(conn, msg);
  });
  conn.on('close', (code, reason) => {
    server.on_disconnection(conn, code, reason)
  });
});
