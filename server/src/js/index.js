'use strict';

process.title = 'recordscratch-server';

const http = require('http');
const ws = require('ws');

const config = require('./config.js');
const msg_types = [
  require('./msg/track_create.js'),
  require('./msg/track_get.js'),
  require('./msg/user_sign_in.js'),
  require('./msg/user_sign_out.js'),
  require('./msg/user_sign_up.js'),
];

console.log(`Creating HTTP server on port ${config.port}`);
const http_server = http.createServer(async (request, response) => {
  try {
    console.log(`Request: ${request.method} ${request.url}`);

    response.setHeader('Access-Control-Allow-Origin', config.allow_origin);
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if(request.method == 'OPTIONS') { // Asking for permission
      response.writeHead(200);
      response.end();
      return;
    }

    // If we fell through here we have no handler for request
    response.writeHead(400);
    response.end('Bad Request');
  } catch(e) {
    console.log(`Uncaught exception '${e}' for request ${request.url}`);
    response.writeHead(500);
    response.end('Internal Server Error');
  }
});
http_server.listen(config.port);

console.log(`Creating WS server on port ${config.port}`);
let next_conn_id = 0;
new ws.Server({
  server: http_server,
}).on('connection', (conn, request) => {
  conn.id = next_conn_id++;
  console.log(`Connection: ${conn.id} (${request.socket.remoteAddress})`);
  conn.on('message', async msg_raw => {
    const msg = JSON.parse(msg_raw);
    msg.reply = (msg_reply) => {
      msg_reply.id = msg.id;
      conn.send(JSON.stringify(msg_reply));
    };
    for(let msg_type of msg_types) {
      if(msg.type == msg_type.name) {
        if(msg_type.fields) {
          for(let field_name in msg_type.fields) {
            if(!msg[field_name]){
              return msg.reply({
                type: 'error',
                text: `Missing field for '${msg.type}' message: ${field_name}`,
              });
            }
          }
        }
        return msg_type.on_message(conn, msg);
      }
    }
    msg.reply({
      type: 'error',
      text: `Unknown message type: ${msg.type}`,
    });
  });
  conn.on('close', (code, reason) => {
    console.log(`Disconnection: ${conn.id} (${code}: ${reason})`);
  });
});
