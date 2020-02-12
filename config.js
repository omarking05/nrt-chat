const express     = require('express');
const httpServer  = require('http');
const socketIo    = require('socket.io');
const mongoose    = require("mongoose");

const app         = express();
const Server      = httpServer.Server(app);
const io          = socketIo(Server);

/** database connection*/
mongoose.connect("mongodb://"+process.env.DATABASE_HOST+"/"+process.env.DATABASE_NAME, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("Successfully connect to MongoDB."))
    .catch(err => console.error("Connection error", err));

module.exports = {
  app,
  Server,
  io
}