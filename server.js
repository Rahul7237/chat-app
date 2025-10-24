const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

let users = {}; // { username: socketId }

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // Set username only when login button is clicked
  socket.on("setUsername", (username) => {
    if (!username) return;

    socket.username = username;
    users[username] = socket.id;

    io.emit("onlineUsers", Object.keys(users)); // update everyone
  });

  // Private message
  socket.on("privateMessage", ({ to, message }) => {
    const toSocket = users[to];
    if (toSocket) {
      io.to(toSocket).emit("receiveMessage", {
        from: socket.username,
        message,
      });
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    if (socket.username) {
      delete users[socket.username];
      io.emit("onlineUsers", Object.keys(users));
    }
    console.log("Disconnected:", socket.id);
  });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
