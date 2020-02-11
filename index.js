require('dotenv-safe').config();

const twilio            = require('twilio');
const express           = require('express');
const bodyParser        = require('body-parser');
const WhatsAppMessage   = require('./whatsapp-message');

const accountId         = process.env.TWILIO_ACCOUNT_ID;
const authToken         = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client            = twilio(accountId, authToken);
const app               = express();
const port              = process.env.APP_PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (_, res) => {
  res.send('Hey There.');
});

app.post('/chat', function (req, res) {
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

app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});



