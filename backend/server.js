require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const httpServer = http.createServer(app);
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
    io.sockets.emit("chat", {
      ...data,
      lat: data.lat,
      lng: data.lng,
    });
  });
  socket.on("typing", (name) => {
    socket.broadcast.emit("typing", name);
  });

  // WebRTC signaling relays
  socket.on("webrtc-offer", (data) => {
    socket.broadcast.emit("webrtc-offer", { ...data, from: socket.id });
  });
  socket.on("webrtc-answer", (data) => {
    socket.broadcast.emit("webrtc-answer", { ...data, from: socket.id });
  });
  socket.on("webrtc-candidate", (data) => {
    socket.broadcast.emit("webrtc-candidate", { ...data, from: socket.id });
  });

  socket.on("disconnect", () => {
    // Emit updated user count to all clients
    io.sockets.emit("users", io.engine.clientsCount);
  });
});

app.get("/", (req, res) => {
  res.send("Socket.IO backend is running.");
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`> Backend ready on http://localhost:${PORT}`);
});
