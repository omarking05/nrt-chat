const Agent                   = require('../models/agent');
const Chat                    = require('../models/chat');
const { io }                  = require('../config');
const chatService             = require('./chatService');
const { CHAT_STATUS_PENDING } = require('../models/chat-status');

/**
 * This function get all available agents in the system
 * and return random agent
 */
async function getRandomAvailableAgent() {
  const agents = await Agent.find({
    $where: function() {
      return (this.currentNumberOfChats < this.maxNumberOfChats) && this.isAvailable
    }
  });

  // Pick random agent
  return agents[Math.floor(Math.random() * agents.length)];
}

/**
 * This is to handle assign incoming chats to random available agents
 * @param {Chat} chat 
 */
async function assignChatToRandomAgents(chat) {
  // If he is not available then pick random available agent
  const randomAgent = await getRandomAvailableAgent();
  let agent = -1; // Right now mark agent as -1 to know that we have pending chat

  // If no agents are available we should add it to queue
  if (!randomAgent) {
    // Mark chat as pending
    chat.status = CHAT_STATUS_PENDING;
    chat.save();
  } else {
    agent = randomAgent;
  }

  return agent;
}

/**
 * This is just to log which agent is assigned to the incoming chat
 * @param {Agent} agent 
 */
function logAssignedAgent(agent) {
  if (agent === -1) {
    console.log('- DECISION_MAKER::: No agent is available to handle this message');
    console.log('- DECISION_MAKER::: Adding it to queue');
  } else {
    console.log('------------- Agent Handling Message -------------');
    console.log(`Name: ${agent.name}`);
    console.log(`isAvailable: ${agent.isAvailable}`);
    console.log(`Max #Chats: ${agent.maxNumberOfChats}`);
    console.log(`Current #Chats: ${(agent.currentNumberOfChats || 0) + 1}`);
    console.log('------------- Agent Handling Message -------------');
  }
}

module.exports = {
  async handleIncomingMessage(incomingMessage) {
    let agent = null;

    // Check if we have a chat that is currently going with this senderId
    const chat  = await Chat.findOne().where('senderId').equals(incomingMessage.senderId).where('status').ne('close');
    
    // In case we already have a chat
    if (chat) {
      console.log('- DECISION_MAKER::: This is an ongoing chat');

      // Find the current agent who is handling this chat
      const suggestedAgent = await Agent.findById(chat.currentAgentId);

      // Check if he is available and pass incoming message to him
      if (suggestedAgent.isAvailable) {
        agent = suggestedAgent;
      } else {
        agent = await assignChatToRandomAgents(chat);
      }

    } else {
      console.log('- DECISION_MAKER::: This is a new chat');
      
      // If we don't have a chat, then its a new message with a new chat
      agent = await assignChatToRandomAgents(chat);

      // If we found an available agent
      if (agent !== -1) {
        // Increae current number of chats for this agent
        await Agent.findOneAndUpdate({_id: agent.id}, {
          currentNumberOfChats: (agent.currentNumberOfChats || 0) + 1
        });
      }
    }

    logAssignedAgent(agent);

    // Only if there is available agent
    if (agent !== -1) {
      // Assign message to this agent
      incomingMessage.agentId = agent.id;
          
      // Send this message to this agent only
      io.to(agent.id).emit('wa_message', incomingMessage);
    }

    // Then save it to DB
    chatService.saveIncomingMessageToDb(incomingMessage);
  }
};