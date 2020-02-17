const Agent       = require('../models/agent');
const Chat        = require('../models/chat');
const Message     = require('../models/message');
const { io }      = require('../config');
const chatService = require('./chatService');
const ChatStatus  = require('../models/chat-status');

/**
 * This function get all available agents in the system
 * and return random agent
 * @returns {Agent}
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
 * This is to assign chat to a random agent
 * @param {Chat} chat 
 */
async function assignChatToRandomAgents(chat) {
  // If he is not available then pick random available agent
  const randomAgent = await getRandomAvailableAgent();
  let agent = -1; // Right now mark agent as -1 to know that we have pending chat

  // If no agents are available we should add it to queue
  if (!randomAgent) {
    // Mark chat as pending
    chat.status = ChatStatus.CHAT_STATUS_NEED_REASSIGN;
    await chat.save();
  } else {
    agent = randomAgent;
  }

  return agent;
}

/**
 * This to send all chat messages to agent via websockets
 * @param {Chat} chat 
 * @param {Agent} agent 
 */
async function sendChatToAgent(chat, agent) {
  io.to(agent.id).emit('wa_chat', chat);
}

/**
 * This should always be called, whenever we need to look for any UNASSIGNED/NEED_REASSIGN chats
 * @param {Agent} agent 
 */
async function searchAndAssignParkedChats(agent = null) {
  console.log('------------- DM::Search -------------');

  if (!agent || !agent.isAvailable) {
    agent = await getRandomAvailableAgent();
  }
  
  // No available agents 
  if (!agent || !agent.isAvailable) {
    console.log('DM:: System has no available agent, pass...');
    return;
  }

  // Get all NEED_REASSIGN chats first
  /** @type {Chat[]} */
  let toBeAssignedChats = await Chat.find({status: ChatStatus.CHAT_STATUS_NEED_REASSIGN}).populate('messages');

  // In case we have no chats that needs to be reassigned
  if (toBeAssignedChats.length === 0) {
    // Get all UNASSIGNED chats
    toBeAssignedChats = await Chat.find({status: ChatStatus.CHAT_STATUS_UNASSIGNED}).populate('messages');

    // In case we have no chats that needs to be assigned
    if (toBeAssignedChats.length === 0) {
      console.log('DM:: System has no parked chats to be assigned, pass...');
      return;
    }
  }

  console.log(`DM:: Found (${toBeAssignedChats.length} Chats) to be assigned`);

  for(const toBeAssignedChat of toBeAssignedChats) {
    // Find the current agent who is handling this chat
    /** @type {Agent} */
    let suggestedAgent            = await Agent.findById(toBeAssignedChat.currentAgentId);

    // Check if this was not even yet handled by agent
    // Or agent is not available
    if (!suggestedAgent || !suggestedAgent.isAvailable || (suggestedAgent && suggestedAgent.maxNumberOfChats <= suggestedAgent.currentNumberOfChats)) {
      console.log(`DM::CHAT_LOOP:: Chat (${toBeAssignedChat.id}) is new chat, or its agent is not available, or cannot handle anymore chats`);
      console.log('DM::CHAT_LOOP:: Assigning it to new random agent..');
      // Then we need to choose a random available agent
      suggestedAgent = agent;
    }

    // Assign chat to agent and update its status
    toBeAssignedChat.currentAgentId = suggestedAgent.id;
    toBeAssignedChat.status         = ChatStatus.CHAT_STATUS_ACTIVE;

    // Mark all chat messages related to this agent
    for(const message of toBeAssignedChat.messages) {
      message.agentId = agent.id;
      await message.save();
    }
    await toBeAssignedChat.save();
    chatService.increaseNumberOfChatsForAgent(suggestedAgent.id);

    console.log(`DM::CHAT_LOOP:: Assigned chat to agent ${suggestedAgent.name}`);
    console.log(`DM::CHAT_LOOP:: Max #chats = ${suggestedAgent.maxNumberOfChats}`);
    console.log(`DM::CHAT_LOOP:: Current #chats = ${(suggestedAgent.currentNumberOfChats || 0) + 1}`);

    await sendChatToAgent(toBeAssignedChat, suggestedAgent);
  }

  console.log('------------- DM::Search -------------');
}

module.exports = {
  /**
   * This is responsible for handling chats when agent changes his availablity status
   * @param {String} agentId 
   */
  async handleAgentStatus(agentId) {
    const agent = await Agent.findById(agentId);

    if (!agent) {
      console.log(`AGENT_STATUS:: cannot find agent with ID (${agentId})`);
      return;
    }

    // In case agent is now unavailable
    if (!agent.isAvailable) {
      // Get all chats handled by this agent
      /** @type {Chat[]} */
      const chats = await  Chat.find({currentAgentId: agent.id});

      for (const chat of chats) {
        // Change chat status
        chat.status         = ChatStatus.CHAT_STATUS_NEED_REASSIGN;
        await chat.save();
        // Decrease number of current chats for agent
        await chatService.decreaseNumberOfChatsForAgent(agentId);
      }
    }
    // Do a round of search to handle changed chats
    await searchAndAssignParkedChats(agent);
  },
  /**
   * This is to handle incoming message from channels
   * @param {IncomingMessage} incomingMessage 
   */
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