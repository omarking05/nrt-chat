const IncominMessage  = require('../models/whatsapp/incoming-message');
const decisionMaker   = require('../services/decisionMaker');
const twilio          = require('twilio');


module.exports = {
  async twilio(req, res) {
    const rawMessage      = req.body;
    const incomingMessage = new IncominMessage(rawMessage);

    console.log('------------- Incoming message -------------');
    console.log(incomingMessage);
    console.log('------------- Incoming message -------------');

    // Let the decision maker choose which agent should reply to this message
    decisionMaker.handleIncomingMessage(incomingMessage);

    // reply to twilio that everything is good and handled
    const response  = twilio.twiml.MessagingResponse('replied');
    res.send(response);
  }
};