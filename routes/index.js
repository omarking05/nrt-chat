const path              = require('path');
const twilio            = require('twilio');
const WhatsAppMessage   = require('../models/whatsapp-message');
const routes            = require('express').Router();
const accountId         = process.env.TWILIO_ACCOUNT_ID;
const authToken         = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client            = twilio(accountId, authToken);

routes.get('/', (_, res) => {
  res.send('Hey There.');
});

routes.post('/chat', (req, res) => {
  const rawMessage        = req.body;
  const formattedMessage  = new WhatsAppMessage(rawMessage);

  console.log('--------------------------');
  console.log(`From: ${formattedMessage.From}`);
  console.log(`Body: ${formattedMessage.Body}`);
  console.log('--------------------------');

  const replyBody = 'I got your message';

  client.messages.create({
    from: twilioPhoneNumber,
    body: replyBody,
    to: formattedMessage.From
  }).then(message => {
    console.log(`Replied with: ${replyBody}`);
  });

  // Twiml response
  const response  = twilio.twiml.MessagingResponse(replyBody);
  res.send(response);
});

routes.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname + '/../views/chat.html'));
});

module.exports = routes;