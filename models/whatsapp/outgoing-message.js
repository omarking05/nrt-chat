class OutgoingMessage {
  constructor(message) {
    this.type                 = 'outgoing';
    this.accountSid           = message.accountSid;
    this.dateCreated          = message.dateCreated;
    this.dateUpdated          = message.dateUpdated;
    this.dateSent             = message.dateSent;
    this.body                 = message.body;
    this.direction            = message.direction;
    this.errorCode            = message.errorCode;
    this.errorMessage         = message.errorMessage;
    this.messagingServiceSid  = message.messagingServiceSid;
    this.numMedia             = message.numMedia;
    this.numSegments          = message.numSegments;
    this.price                = message.price;
    this.priceUnit            = message.priceUnit;
    this.sid                  = message.sid;
    this.status               = message.status;
    this.subresourceUris      = message.subresourceUris;
    this.from                 = message.from.replace('whatsapp:', '');
    this.apiVersion           = message.apiVersion;
    this.time                 = new Date();
  }
}

module.exports = OutgoingMessage;