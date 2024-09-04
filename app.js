// app.js
const express = require('express');
// const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');

// Initialize Express app
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Function to set up the PeerJS server with the passed HTTP server
function setupPeerServer(server) {
  const peerServer = ExpressPeerServer(server, {
    debug: true,
  });
  app.use('/peerjs', peerServer);
}

// Routes
// app.get('/', (req, res) => {
//   res.redirect(`/${uuidv4()}`); // Generate and send a unique room ID
// });

app.get('/:room', (req, res) => {
  res.render('index', { RoomId: req.params.room }); // Render the chat room
});

module.exports = { app, setupPeerServer };
