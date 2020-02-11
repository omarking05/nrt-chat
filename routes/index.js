const path                = require('path');
const twilio              = require('twilio');
const WhatsAppMessage     = require('../models/whatsapp-message');
const routes              = require('express').Router();
const { io, mongoClient } = require('../config');
const accountId           = process.env.TWILIO_ACCOUNT_ID;
const authToken           = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber   = process.env.TWILIO_PHONE_NUMBER;
const client              = twilio(accountId, authToken);
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

  io.sockets.emit('wa_message', formattedMessage);

  console.log('--------------------------');
  console.log(`From: ${formattedMessage.From}`);
  console.log(`Body: ${formattedMessage.Body}`);
  console.log('--------------------------');

  const replyBody = `I got your message ${formattedMessage.Body}`;

  client.messages.create({
    from: twilioPhoneNumber,
    body: replyBody,
    to: formattedMessage.From
  }).then(_ => {
    console.log('Replied with:', replyBody);
  }).catch(error => {
    console.log(error);
  });

  // Twiml response
  const response  = twilio.twiml.MessagingResponse(replyBody);

  saveIncomingMessageToDb(formattedMessage);

  res.send(response);
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