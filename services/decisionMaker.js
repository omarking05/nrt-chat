const Agent       = require('../models/agent');
const Chat        = require('../models/chat');
const { io }      = require('../config');
const chatService = require('./chatService');
const ChatStatus  = require('../models/chat-status');

module.exports = {
  async handleIncomingMessage(incomingMessage) {
    let agent = null;

    // Check if we have an active chat that is currently going with this senderId
    const chat  = await Chat.findOne({senderId: incomingMessage.senderId, status: ChatStatus.CHAT_STATUS_ACTIVE});

    // In case we already have a chat
    if (chat) {
      // Find the current agent who is handling this chat
      agent = await Agent.findById(chat.currentAgentId);

      // Check if he is available and pass incoming message to him


      // If he is not available then pick random available agent


      // If no agents are available we should add it to queue

    } else {
      // If we don't have a chat, then its a new message with a new chat

      // Then get all of our active agents
      // That their current chats number is less than their max chats number

      const agents = await Agent.find({
        $where: function() {
          return (this.currentNumberOfChats && (this.currentNumberOfChats < this.maxNumberOfChats) && this.isAvailable) || this.isAvailable;
        }
      });

      // Pick random agent
      agent = agents[Math.floor(Math.random() * agents.length)];
    }

    // Then decide

    // Message could be from NEW visitor
    // ---> Then pass it to new random agent


    // Message could be from OLD visitor (agent is already chatting with)
    // ---> Then pass it to the agent already chatting

      // How do we know if this incoming message is from NEW or OLD visitor?
        // By IncomingMessage.senderId
        // If this senderId already handled by one of our agents then its an old one
        // If NOT then its a new chat

      // How can we pass messages to agents?
        // Using socket.io i think we can have channels
        // Each agent has his own channel with the server as long as he is available to chat
        // When new message comes, get the agent to send it to
        // Then get his channel, and pass this message to this channel
        // io.to(agentId).emit('wa_message', incomingMessage);

    if (agent) {
      console.log('------------- Agent Handling Message -------------');
      console.log(`Name: ${agent.name}`);
      console.log(`isAvailable: ${agent.isAvailable}`);
      console.log(`Max #Chats: ${agent.maxNumberOfChats}`);
      console.log(`Current #Chats: ${agent.currentNumberOfChats}`);
      console.log('------------- Agent Handling Message -------------');

      // Assign message to this agent
      incomingMessage.agentId = agent.id;

      // Send this message to this agent only
      // TODO If chat was changed from unassigned to active
      //  and when we have several messages from visitor - we need to send all these messages
      //  Now we just send the last message
      io.to(agent.id).emit('wa_message', incomingMessage);
    }

    // Then save it to DB
    chatService.saveIncomingMessageToDb(incomingMessage);
  }
};