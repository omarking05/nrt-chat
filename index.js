require('dotenv-safe').config();

const bodyParser        = require('body-parser');
const routes            = require('./routes');
const {app, Server, io} = require('./config');
const express           = require('express')
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilio            = require('twilio');
const port              = process.env.APP_PORT;
const WhatsAppMessage   = require('./models/whatsapp-message');

/** Server Config */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
/** Server Config */

/** Routes Config */
app.use('/', routes);
/** Routes Config */

/** Socket io connection */
io.on('connection', (socket) => {
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
      var newWhatsAppMessage = new WhatsAppMessage({
        'From': response.to,
        'Body': response.body
      });

      newWhatsAppMessage.isReplyFromAgent = true;
      io.sockets.emit('wa_message', newWhatsAppMessage);
      console.log (msg);
      // TODO Need insert reply into database
    }).catch(error => {
      console.log(error);
    });

    // Twiml response
    // TODO Commented this code, need investigate later.
    // const response  = twilio.twiml.MessagingResponse('hello world');
  });
});
/** Socket io connection */

Server.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});




