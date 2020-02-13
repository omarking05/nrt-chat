const Agent       = require('../models/agent');
const Chat        = require('../models/chat');
const { io }      = require('../config');
const chatService = require('./chatService');

module.exports = {
  async handleIncomingMessage(incomingMessage) {

    // Check if we have a chat that is currently going with this senderId
    const chat  = await Chat.findOne().where('senderId').equals(incomingMessage.senderId);

    console.log('Chat', chat);
    
    // In case we already have a chat
    if (chat) {

    }

    // Then get all of our active agents
    // That their current chats number is less than their max chats number

    const agents = await Agent.find({
      $where: () => {
        return this.currentNumberOfChats < this.maxNumberOfChats;
      }
    });

    // console.log(agents)

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

    io.sockets.emit('wa_message', incomingMessage);

    chatService.saveIncomingMessageToDb(incomingMessage);
  }
};