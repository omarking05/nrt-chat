const unifyWhatsappPhoneNumber = require('../..//helpers/string').unifyWhatsappPhoneNumber;

class OutgoingMessage {
  constructor(message) {
    this.type           = 'outgoing';
    this.accountSid     = message.accountSid;
    this.body           = message.body;
    this.numMedia       = message.numMedia;
    this.senderId       = unifyWhatsappPhoneNumber(message.to);
    this.apiVersion     = message.apiVersion;
    this.agentId        = ''; // Relation with agent 
    this.time           = new Date();
  }
}

module.exports = OutgoingMessage;