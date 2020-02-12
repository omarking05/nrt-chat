class IncomingMessage {
  constructor(message) {
    this.type           = 'incoming';
    this.smsMessageSid  = message.SmsMessageSid;
    this.numMedia       = message.NumMedia;
    this.smsSid         = message.SmsSid;
    this.smsStatus      = message.SmsStatus;
    this.body           = message.Body;
    this.to             = message.To;
    this.numSegments    = message.NumSegments;
    this.messageSid     = message.MessageSid;
    this.accountSid     = message.AccountSid;
    this.from           = message.From.replace('whatsapp:', '');
    this.apiVersion     = message.ApiVersion;
    this.time           = new Date();
  }
}

module.exports = IncomingMessage;