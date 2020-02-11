const express     = require('express');
const httpServer  = require('http');
const socketIo    = require('socket.io');

const app         = express();
const Server      = httpServer.Server(app);
const io          = socketIo(Server);

module.exports = {
  app,
  Server,
  io
}