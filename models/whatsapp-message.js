class WhatsAppMessage {
  constructor(message) {
    this.SmsMessageSid  = message.SmsMessageSid;
    this.NumMedia       = message.NumMedia;
    this.SmsSid         = message.SmsSid;
    this.SmsStatus      = message.SmsStatus;
    this.Body           = message.Body;
    this.To             = message.To;
    this.NumSegments    = message.NumSegments;
    this.MessageSid     = message.MessageSid;
    this.AccountSid     = message.AccountSid;
    this.From           = message.From.replace('whatsapp:', '');
    this.ApiVersion     = message.ApiVersion;
    this.Time           = new Date();
  }
}

module.exports = WhatsAppMessage;