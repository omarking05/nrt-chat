class IncomingMessage {
  constructor(message) {
    this.type           = 'incoming';
    this.numMedia       = message.NumMedia;
    this.body           = message.Body;
    this.to             = message.To.replace('whatsapp:', '');
    this.accountSid     = message.AccountSid;
    this.from           = message.From.replace('whatsapp:', '');
    this.apiVersion     = message.ApiVersion;
    this.agentId        = ''; // Relation with agent
    this.time           = new Date();
  }
}

module.exports = IncomingMessage;