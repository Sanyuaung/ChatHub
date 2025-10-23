require("dotenv").config();
const express = require("express");
const next = require("next");
const http = require("http");
const socketIO = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);
  const io = socketIO(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // Socket.IO logic
  io.on("connection", (socket) => {
    // Emit updated user count to all clients
    io.sockets.emit("users", io.engine.clientsCount);

    socket.on("chat", (data) => {
      io.sockets.emit("chat", data);
    });
    socket.on("typing", (name) => {
      socket.broadcast.emit("typing", name);
    });

    socket.on("disconnect", () => {
      // Emit updated user count to all clients
      io.sockets.emit("users", io.engine.clientsCount);
    });
  });

  server.use((req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 4000;
  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
