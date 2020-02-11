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
const mongodb           = require('mongodb');


const mongoClient = new mongodb.MongoClient("mongodb://33.33.33.10:27017/", { useUnifiedTopology: true });

mongoClient.connect(function(err, client){
  if(err) return console.log(err);
  var db = client.db('cobrowser_v3');
  db.createCollection('nrt_messages');
  app.db = db
});

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

  const message = {
    "from": formattedMessage.From,
    "body": formattedMessage.Body,
    "status": "pending",
    "time": new Date()
  };

  app.db.collection('nrt_messages').insertOne(message);

});

server.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});




