const path                = require('path');
const WhatsAppMessage     = require('../models/whatsapp-message');
const Chat                = require('../models/chat');
const Message             = require('../models/message');
const routes              = require('express').Router();
const { io }              = require('../config');

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

  createMessage(message, existChat._id);
}

const createChat = function(chat) {
    return Chat.create(chat).then(docTutorial => {
        console.log("\n>> Created new Chat done");
        return docTutorial;
    });
};

const createMessage = function(message, chatId) {
    return Message.create(message).then(docMessage => {
        console.log("\n>> Created new message done ");
        return Chat.findByIdAndUpdate(chatId,
            { $push: { messages: docMessage._id } },
            { new: true, useFindAndModify: false }
        );
    });
};

const findChatBySenderId = function(senderId) {
    return Chat.find({sender_id: senderId});
};

module.exports = routes;