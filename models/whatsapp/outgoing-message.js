class OutgoingMessage {
  // TODO wher is the "to"!!!!!?
  constructor(message) {
    this.type           = 'outgoing';
    this.accountSid     = message.accountSid;
    this.body           = message.body;
    this.numMedia       = message.numMedia;
    this.senderId       = message.to.replace('whatsapp:', '');
    this.apiVersion     = message.apiVersion;
    this.agentId        = ''; // Relation with agent 
    this.time           = new Date();
  }
}

module.exports = OutgoingMessage;