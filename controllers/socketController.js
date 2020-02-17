const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilio            = require('twilio');
const OutgoingMessage   = require('../models/whatsapp/outgoing-message');
const chatService       = require('../services/chatService');
const { io }            = require('../config');

const handleSocket = async function(socket) {
  // Get the id of the connected agent
  const agentId = socket.handshake.headers['x-agentid'];

  // Subscribe this socket to agent
  // This is needed in order to use "io.to(agentId).emit('wa_message', incomingMessage);"
  // When we need to send incoming message to this and only this agent
  socket.join(agentId);

  // Handle outgoing message
  // Right now we only take this message, save it and send it to visitor
  socket.on('wa_reply', function(msg) {
    const accountId           = process.env.TWILIO_ACCOUNT_ID;
    const authToken           = process.env.TWILIO_AUTH_TOKEN;
    const client              = twilio(accountId, authToken);

    client.messages.create({
      from: twilioPhoneNumber,
      body: msg.text,
      to: 'whatsapp:' + msg.userId
    }).then(response => {
      const newOutgoingMessage = new OutgoingMessage(response);
      newOutgoingMessage.isAgent = true;
      newOutgoingMessage.agentId = agentId;
      chatService.saveIncomingMessageToDb(newOutgoingMessage);

      // Send this message only to the agent
      io.to(agentId).emit('wa_message', newOutgoingMessage);
    }).catch(error => {
      console.log(error);
    });
  });
};

module.exports = handleSocket;
