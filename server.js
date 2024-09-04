// server.js
const http = require('http');
const { app, setupPeerServer } = require('./app'); // Import the Express app and PeerJS setup function
const { Server } = require('socket.io');
const WebSocket = require('ws');

// Create HTTP server and integrate Express app
const server = http.createServer(app);

// Setup PeerJS server
setupPeerServer(server);

// Setup WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    console.log('Received:', message);
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Setup Socket.IO server
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust as necessary for your CORS needs
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('New Socket.IO connection');

  socket.on('newUser', (id, room) => {
    socket.join(room);
    socket.broadcast.to(room).emit('userJoined', id);

    // Listen for chat messages
    socket.on('sendMessage', (message, username) => {
      const timestamp = new Date().toLocaleTimeString();
      const chatMessage = {
        username,
        message,
        time: timestamp
      };
      io.to(room).emit('receiveMessage', chatMessage);
    });

    socket.on('disconnect', () => {
      socket.broadcast.to(room).emit('userDisconnect', id);
    });
  });
});

// Start the server
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = server;
