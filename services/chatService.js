const Chat    = require('../models/chat');
const Message = require('../models/message');

function createChat (chat) {
  return Chat.create(chat).then(docTutorial => {
    console.log("\n>> Created new Chat done");
    return docTutorial;
  });
}

function createMessage (message, chatId) {
  return Message.create(message).then(docMessage => {
    console.log("\n>> Created new message done ");
    return Chat.findByIdAndUpdate(chatId,
      { $push: { messages: docMessage._id } },
      { new: true, useFindAndModify: false }
    );
  });
}

function findChatBySenderId (senderId) {
  return Chat.findOne({senderId: senderId});
}

module.exports = {
  async saveIncomingMessageToDb(formattedMessage) {
    var existChat = await findChatBySenderId(formattedMessage.senderId);
    if (!existChat) {
      existChat = await createChat({channelType: 'whatsapp', senderId: formattedMessage.senderId, currentAgentId: formattedMessage.agentId});
    } else {
      existChat = existChat;
    }

    formattedMessage.existChat = existChat;

    createMessage(formattedMessage, existChat._id);
  }
};