const Chat    = require('../models/chat');
const Message = require('../models/message');
const CHAT_STATUSES = require('../constants').CHAT_STATUSES;

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

function findNonClosedChatBySenderId (senderId) {
  return Chat.findOne({senderId: senderId, status: {$ne: CHAT_STATUSES.CLOSE}});
}

module.exports = {
  async saveIncomingMessageToDb(formattedMessage) {
    let existChat = await findNonClosedChatBySenderId(formattedMessage.senderId);
    const status = formattedMessage.agentId ? CHAT_STATUSES.ACTIVE : CHAT_STATUSES.UNASSIGNED
    if (!existChat) {
      existChat = await createChat({
        channelType: 'whatsapp',
        senderId: formattedMessage.senderId,
        currentAgentId: formattedMessage.agentId,
        status
      });
    } else {
      existChat.status = status;
    }

    formattedMessage.existChat = existChat;

    createMessage(formattedMessage, existChat._id);
  },

  async closeActiveChat(senderId) {
    return await Chat.updateOne({senderId: senderId, status: CHAT_STATUSES.ACTIVE}, {status: CHAT_STATUSES.CLOSE});
  }
};