import http from 'http';
import ws from 'ws'
import RSServer from './RSServer.js';
import config from './config.js';

const server = new RSServer();
process.title = 'recordscratch-server';

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
new ws.Server({
  server: http_server,
}).on('connection', (conn, request) => {
  conn.send_msg = (msg) => {
    conn.send(JSON.stringify(msg));
  };
  server.on_connection(conn, request);
  conn.on('message', async (msg_raw, is_binary) => {
    if(is_binary) {
      server.on_binary_message(conn, msg_raw);
      return;
    } else {
      const msg = JSON.parse(msg_raw);
      msg.reply = (msg_reply) => {
        msg_reply.id = msg.id;
        conn.send_msg(msg_reply);
      };
      server.on_message(conn, msg);
    }
  });
  conn.on('close', (code, reason) => {
    server.on_disconnection(conn, code, reason)
  });
});
