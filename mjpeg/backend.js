const rtsp = require('rtsp-ffmpeg');
const http = require('http');
const WebSocketServer = require('websocket').server;

const server = http.createServer(function (request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(1233, function () {
  console.log((new Date()) + ' Server is listening on port 1233');
});

wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

wsServer.on('request', function (request) {
  const connection = request.accept();
  console.log((new Date()) + ' Connection accepted.');

  const  uri = 'rtsp://localhost:8554/example';
  const stream = new rtsp.FFMpeg({ input: uri });

  const pipeStream = function (data) {
    connection.send(data.toString('base64'));
  };
  stream.on('data', pipeStream);
  stream.on('error', console.error);
  connection.on('close', () => {
    stream.removeListener('data', pipeStream);
  });
});