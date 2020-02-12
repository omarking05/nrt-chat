const path                = require('path');
const twilio              = require('twilio');
const WhatsAppMessage     = require('../models/whatsapp-message');
const Chat                = require('../models/chat');
const Message             = require('../models/message');
const routes              = require('express').Router();
const { io }              = require('../config');
const accountId           = process.env.TWILIO_ACCOUNT_ID;
const authToken           = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber   = process.env.TWILIO_PHONE_NUMBER;
const client              = twilio(accountId, authToken);

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

async function saveIncomingMessageToDb(formattedMessage) {
  var existChat = await findChatBySenderId(formattedMessage.From);
  if (!existChat || existChat.length == 0) {
      existChat = await createChat({channel_type: 'whatsapp', sender_id: formattedMessage.From});
  } else {
    existChat = existChat[0];
  }
  const message = {
    'from'  : formattedMessage.From,
    'to'    : formattedMessage.To,
    'body'  : formattedMessage.Body,
    'status': 'pending',
    'time'  : new Date(),
    'chat'  : existChat
  };

  createMessage(message);
}

const createChat = function(chat) {
    return Chat.create(chat).then(docTutorial => {
        console.log("\n>> Created new Chat done");
        return docTutorial;
    });
};

function createMessage(message) {
    Message.create(message).then(docComment => {
        console.log("\n>> Created new message done");
    });
};

const findChatBySenderId = function(senderId) {
    return Chat.find({sender_id: senderId});
};

module.exports = routes;