const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilio            = require('twilio');
const OutgoingMessage   = require('../models/whatsapp/outgoing-message');
const chatService       = require('../services/chatService');
// const { io }            = require('../config');

const handleSocket = function(socket) {

    socket.on('wa_reply', function(msg) {
        const accountId           = process.env.TWILIO_ACCOUNT_ID;
        const authToken           = process.env.TWILIO_AUTH_TOKEN;
        const client              = twilio(accountId, authToken);

        client.messages.create({
            from: twilioPhoneNumber,
            body: msg.text,
            to: 'whatsapp:' + msg.userId
        }).then(response => {
            const newOutgoingMessage = new OutgoingMessage({
                body: response.body,
                from: response.to,
                to  : response.from
            });
            newOutgoingMessage.isReplyFromAgent = true;
            newOutgoingMessage.agent = true;
            chatService.saveIncomingMessageToDb(newOutgoingMessage);
            // TODO or io.sockets.emit('wa_message', newOutgoingMessage);
            socket.emit('wa_message', newOutgoingMessage);
            console.log (msg);

            // TODO Need insert reply into database
        }).catch(error => {
            console.log(error);
        });

        // Twiml response
        // TODO Commented this code, need investigate later.
        // const response  = twilio.twiml.MessagingResponse('hello world');
    });
};

module.exports = handleSocket;
