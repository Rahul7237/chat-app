const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('User connected');

  // Set username
  socket.on('setUsername', (username) => {
    socket.username = username;
    io.emit(
      'onlineUsers',
      Array.from(io.sockets.sockets.values())
        .map((s) => s.username)
        .filter(Boolean)
    );
  });

  // Private messages
  socket.on('privateMessage', ({ to, message }) => {
    for (let [id, s] of io.sockets.sockets) {
      if (s.username === to) {
        s.emit('receiveMessage', { from: socket.username, message });
        break;
      }
    }
  });

  socket.on('disconnect', () => {
    io.emit(
      'onlineUsers',
      Array.from(io.sockets.sockets.values())
        .map((s) => s.username)
        .filter(Boolean)
    );
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log('Server running...');
});
