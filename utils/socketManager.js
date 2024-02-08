// socketManager.js

const socketIO = require('socket.io');

let io;

function initSocket(server) {
  io = socketIO(server);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    // Add any additional socket connection logic here
  });
}

function getIo() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

module.exports = { initSocket, getIo };
