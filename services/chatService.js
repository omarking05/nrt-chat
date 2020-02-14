const Chat    = require('../models/chat');
const Message = require('../models/message');
const Agent   = require('../models/agent');
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


// TODO Fake method
function getAvailableAgent() {
  return {
    _id: '5e4542679cc7954314d2beb7'
  }
}

async function increaseNumberOfChatsForAgent(agentId, count = 1){
  await Agent.updateOne(
      {_id: agentId},
      {$inc: {currentNumberOfChats: count}}
  );
}

async function decreaseNumberOfChatsForAgent(agentId, count = -1){
  await Agent.updateOne(
      {_id: agentId},
      {$inc: {currentNumberOfChats: count}}
  );
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

      increaseNumberOfChatsForAgent(formattedMessage.agentId);
    } else {
      // Check if this chat is unassigned and we have available agent and no one agent assigned to chat
      // If so - change status of chat to `active` and assign available agent

      if (existChat.status === CHAT_STATUSES.UNASSIGNED && !existChat.agentId) {
        const agent = getAvailableAgent();
        if (agent) {
          const agentId = agent._id;
          await Chat.updateOne({
            senderId: formattedMessage.senderId,
            status: CHAT_STATUSES.UNASSIGNED
          }, {
            status: CHAT_STATUSES.ACTIVE,
            currentAgentId: agentId
          });

          console.log('__________________');
          console.log (`agentId = ${agentId}`)
          increaseNumberOfChatsForAgent(agentId);
        }
      }
    }

    formattedMessage.existChat = existChat;

    createMessage(formattedMessage, existChat._id);
  },

  async closeActiveChat(senderId) {
    // Update status of chat
    const chat = await Chat.findOneAndUpdate({senderId: senderId, status: CHAT_STATUSES.ACTIVE}, {status: CHAT_STATUSES.CLOSE});

    // Decrement count of active chats for agent
    decreaseNumberOfChatsForAgent(chat.currentAgentId)
  }
};