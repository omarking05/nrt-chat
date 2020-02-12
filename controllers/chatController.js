const path                = require('path');
const Chat                = require('../models/chat');
const Message             = require('../models/message');
const chatService         = require('../services/chatService');
const IncominMessage      = require('../models/whatsapp/incoming-message');
const { io }              = require('../config');
const twilio              = require('twilio');


module.exports = {

    async getChats(request, reply) {
        try {
            var chats = await Chat.find().populate("messages")
            return reply.send(chats);
        } catch (error) {
            return reply.send(error).code(500);
        }

    },

    postChat(req, res) {
        const rawMessage        = req.body;
        const formattedMessage  = new IncominMessage(rawMessage);

        // TODO Need to use callback in case when we have troubles with saving into DB
        chatService.saveIncomingMessageToDb(formattedMessage);
        io.sockets.emit('wa_message', formattedMessage);

        console.log('--------------------------');
        console.log(`From: ${formattedMessage.from}`);
        console.log(`Body: ${formattedMessage.body}`);
        console.log('--------------------------');

        // Twiml response
        const response  = twilio.twiml.MessagingResponse('replied');
        res.send(response);
    },

    showAgent(req, res) {
        res.sendFile(path.join(__dirname + '/../views/agent.html'));
    }
};