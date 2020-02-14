const Chat        = require('../models/chat');
const Message     = require('../models/message');
const Agent       = require('../models/agent');
const ChatStatus  = require('../models/chat-status');

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
  return Chat.findOne({senderId: senderId, status: {$ne: ChatStatus.CHAT_STATUS_CLOSED}});
}


// TODO Fake method
function getAvailableAgent() {
  return {
    _id: '5e4542679cc7954314d2beb7'
  }
}

module.exports = {
  async saveIncomingMessageToDb(formattedMessage) {
    let existChat = await findNonClosedChatBySenderId(formattedMessage.senderId);
    const status = formattedMessage.agentId ? ChatStatus.CHAT_STATUS_ACTIVE : ChatStatus.CHAT_STATUS_UNASSIGNED;
    const agent  = await Agent.findById(formattedMessage.agentId);
    if (!existChat) {
      existChat = await createChat({
        channelType: 'whatsapp',
        senderId: formattedMessage.senderId,
        currentAgentId: formattedMessage.agentId,
        currentAgent: agent,
        status
      });

      this.increaseNumberOfChatsForAgent(formattedMessage.agentId);
    } else {
      // Check if this chat is unassigned and we have available agent and no one agent assigned to chat
      // If so - change status of chat to `active` and assign available agent

      if (existChat.status === ChatStatus.CHAT_STATUS_UNASSIGNED && !existChat.agentId) {
        const agent = getAvailableAgent();
        if (agent) {
          const agentId = agent._id;
          await Chat.updateOne({
            senderId: formattedMessage.senderId,
            status: ChatStatus.CHAT_STATUS_UNASSIGNED
          }, {
            status: ChatStatus.CHAT_STATUS_ACTIVE,
            currentAgentId: agentId
          });

          this.increaseNumberOfChatsForAgent(agentId);
        }
      }
    }

    formattedMessage.existChat = existChat;
    createMessage(formattedMessage, existChat._id);
  },

  async closeActiveChat(senderId) {
    // Update status of chat
    const chat = await Chat.findOneAndUpdate({senderId: senderId, status: ChatStatus.CHAT_STATUS_ACTIVE}, {status: ChatStatus.CHAT_STATUS_CLOSED});

    // Decrement count of active chats for agent
    this.decreaseNumberOfChatsForAgent(chat.currentAgentId)
  },

  async increaseNumberOfChatsForAgent(agentId, count = 1){
    await Agent.updateOne(
        {_id: agentId},
        {$inc: {currentNumberOfChats: count}}
    );
  },

  async decreaseNumberOfChatsForAgent(agentId, count = -1){
    await Agent.updateOne(
        {_id: agentId},
        {$inc: {currentNumberOfChats: count}}
    );
  }
};