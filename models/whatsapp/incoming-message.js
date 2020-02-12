class IncomingMessage {
  constructor(message) {
    this.type           = 'incoming';
    this.numMedia       = message.NumMedia;
    this.body           = message.Body;
    this.accountSid     = message.AccountSid;
    this.senderId       = message.From.replace('whatsapp:', '');
    this.apiVersion     = message.ApiVersion;
    this.agentId        = ''; // Relation with agent
    this.time           = new Date();
  }
}

module.exports = IncomingMessage;