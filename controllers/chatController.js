const Chat        = require('../models/chat');
const Agent       = require('../models/agent');
const chatService = require('../services/chatService');
const ChatStatus  = require('../models/chat-status');

module.exports = {
  async getChats(req, res) {
    try {
      const agentId  = req.query.agentId;
      const chats = await Chat.find({currentAgentId: agentId, status: {$ne: ChatStatus.CHAT_STATUS_CLOSED} }).populate('messages')
      return res.send(chats);
    } catch (error) {
      return res.send(error);
    }
  },
  async loginAgent(req, res) {
    const username  = req.body.username;
    const agent     = await Agent.findOne({
      username
    });

    if (!agent) {
      return res.send('Agent not found');
    }

    // Check if agent can NOT take more chats
    if (agent.currentNumberOfChats >= agent.maxNumberOfChats) {
      return res.send('Agent is fulffilled, and cannot take more chats');
    }

    // Let the agent start receive chats
    return res.redirect(`/chat/start?username=${username}`);
  },
  async toggleAgentAvailability(req, res) {
    const agentId     = req.body.id;
    const isAvailable = req.body.isAvailable ? true : false;
    const agent       = await Agent.findOneAndUpdate({_id: agentId}, {isAvailable});

    if (isAvailable) {
      const maximumOfAvailableChats = agent.maxNumberOfChats - agent.currentNumberOfChats;

      // If user has less active chats as maxNumberOfChats
      // Find unassigned chats and assign this agent to chats
      if (maximumOfAvailableChats > 0) {
        const unassignedChats = await Chat
          .find({
            status: ChatStatus.CHAT_STATUS_UNASSIGNED
          })
          .limit(maximumOfAvailableChats)
          .sort({createdAt: 'asc'});

        // TODO Looks not very good
        //  Perhaps exists another way to update fetched data
        unassignedChats.forEach(async (chat) => {
          await Chat.updateOne({_id: chat._id}, {status: ChatStatus.CHAT_STATUS_ACTIVE, currentAgentId: agentId})
        });

        chatService.increaseNumberOfChatsForAgent(agentId, unassignedChats.length)
      }
    }

    // Let the agent start receive chats
    return res.redirect(`/chat/start?username=${agent.username}`);
  },
  async startChat(req, res) {
    const username  = req.query.username;

    if (!username) {
      return res.send('Username must be specified to chat')
    }

    const agent     = await Agent.findOne({
      username
    });

    if (!agent) {
      return res.send('Agent not found');
    }

    // Check if agent can NOT take more chats
    if (agent.currentNumberOfChats >= agent.maxNumberOfChats) {
      return res.send('Agent is fulffilled, and cannot take more chats');
    }

    // Let the agent start receive chats
    return res.render('chat/list', {agent});
  },
  async closeChat(req, res) {
    try {
      await chatService.closeActiveChat(req.body.userId);

      return res.sendStatus(200);
    } catch (error) {
      return res.send(error);
    }
  }
};