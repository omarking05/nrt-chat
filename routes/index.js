const path                = require('path');
const WhatsAppMessage     = require('../models/whatsapp-message');
const routes              = require('express').Router();
const { io }              = require('../config');
const chatController      = require('../controllers/chatController');
const chatService         = require('../services/chatService');

routes.get('/', (_, res) => {
  res.send('Hey There.');
});

routes.post('/chat', (req, res) => {
  const rawMessage        = req.body;
  const formattedMessage  = new WhatsAppMessage(rawMessage);

  // TODO Need to use callback in case when we have troubles with saving into DB
  chatService.saveIncomingMessageToDb(formattedMessage);
  io.sockets.emit('wa_message', formattedMessage);

  console.log('--------------------------');
  console.log(`From: ${formattedMessage.From}`);
  console.log(`Body: ${formattedMessage.Body}`);
  console.log('--------------------------');
});

routes.get('/agent', (_, res) => {
  res.sendFile(path.join(__dirname + '/../views/agent.html'));
});

routes.get('/chats', chatController.getChats);

module.exports = routes;