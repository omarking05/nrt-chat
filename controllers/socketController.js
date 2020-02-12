const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilio            = require('twilio');
const WhatsAppMessage   = require('../models/whatsapp-message');
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

            console.log(response);
            let newWhatsAppMessage = new WhatsAppMessage({
                'From': response.to,
                'Body': response.body
            });

            newWhatsAppMessage.isReplyFromAgent = true;
            // TODO or io.sockets.emit('wa_message', newWhatsAppMessage);
            socket.emit('wa_message', newWhatsAppMessage);
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
