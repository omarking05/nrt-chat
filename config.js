const express     = require('express');
const httpServer  = require('http');
const socketIo    = require('socket.io');
const mongodb     = require('mongodb');

const app         = express();
const Server      = httpServer.Server(app);
const io          = socketIo(Server);
const mongoClient = new mongodb.MongoClient(process.env.MONGO_CONNECTION_STRING, { useUnifiedTopology: true });

module.exports = {
  app,
  Server,
  io,
  mongoClient
}