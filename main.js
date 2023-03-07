const express = require('express');
const expressWs = require('express-ws');
const colors = require('colors');

const app = express();
const port = 9072;

// enable WebSocket support
expressWs(app);

// create an array to store all panel sockets
const panelSockets = [];

// create an array to store all client sockets
const clientSockets = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/main.html');
});

// handle WebSocket connection for panel socket
app.ws('/v1/panel', (ws, req) => {
  console.log(colors.green('Panel socket connected.'));

  // add the socket to the array
  panelSockets.push(ws);

  // handle WebSocket disconnection
  ws.on('close', () => {
    console.log(colors.red('Panel socket disconnected.'));

    // remove the socket from the array
    const index = panelSockets.indexOf(ws);
    if (index !== -1) {
      panelSockets.splice(index, 1);
    }
  });

  // handle incoming messages from client socket
  ws.on('message', (data) => {
    console.log(colors.green('Panel socket received:'), data);

    // send the data to all client sockets
    clientSockets.forEach((clientSocket) => {
      clientSocket.send(data);
    });
  });
});

// handle WebSocket connection for client socket
app.ws('/v1/client', (ws, req) => {
  console.log(colors.green('Client socket connected.'));

  // add the socket to the array
  clientSockets.push(ws);

  // handle incoming messages from client socket
  ws.on('message', (data) => {
    console.log(colors.green('Client socket received:'), data);

    // send the data to all panel sockets
    panelSockets.forEach((panelSocket) => {
      panelSocket.send(data);
    });
  });

  // handle WebSocket disconnection
  ws.on('close', () => {
    console.log(colors.red('Client socket disconnected.'));

    // remove the socket from the array
    const index = clientSockets.indexOf(ws);
    if (index !== -1) {
      clientSockets.splice(index, 1);
    }
  });
});

// start the server
app.listen(port, () => {
  console.log(colors.yellow(`NCP V1 listening at http://localhost:${port}.`));
});
