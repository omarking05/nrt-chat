const path                = require('path');
const WhatsAppMessage     = require('../models/whatsapp-message');
const routes              = require('express').Router();
const { io, mongoClient } = require('../config');
let db                    = {};

mongoClient.connect(function(err, client){
  if(err) return console.log(err);
  db = client.db('cobrowser_v3');
  db.createCollection('nrt_messages');
});

routes.get('/', (_, res) => {
  res.send('Hey There.');
});

routes.post('/chat', (req, res) => {
  const rawMessage        = req.body;
  const formattedMessage  = new WhatsAppMessage(rawMessage);

  // TODO Need to use callback in case when we have troubles with saving into DB
  saveIncomingMessageToDb(formattedMessage);
  io.sockets.emit('wa_message', formattedMessage);

  console.log('--------------------------');
  console.log(`From: ${formattedMessage.From}`);
  console.log(`Body: ${formattedMessage.Body}`);
  console.log('--------------------------');
});

routes.get('/agent', (_, res) => {
  res.sendFile(path.join(__dirname + '/../views/agent.html'));
});

function saveIncomingMessageToDb(formattedMessage) {
  const message = {
    'from'  : formattedMessage.From,
    'to'    : formattedMessage.To,
    'body'  : formattedMessage.Body,
    'status': 'pending',
    'time'  : new Date()
  };

  db.collection('nrt_messages').insertOne(message);
}

module.exports = routes;