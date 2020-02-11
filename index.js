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
const server            = require('http').createServer(app);
const io                = require('socket.io')(server);
const port              = process.env.APP_PORT;
const path              = require('path');

io.on('connection', (socket) => {
  socket.on('chat message', function(msg) {
    socket.emit('send_response', ++msg)
  });
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

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

  let replyBody = `I got your message ${formattedMessage.Body}`;

  client.messages.create({
    from: twilioPhoneNumber,
    body: replyBody,
    to: formattedMessage.From
  }).then(message => {
    io.sockets.emit('wa_message', replyBody)
    console.log(` ${replyBody}`);
  }).catch(error => {
    console.log (error)
  });

  // Twiml response
  const response  = twilio.twiml.MessagingResponse(replyBody);
  res.send(response);
});

server.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});




