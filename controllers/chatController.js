const Chat          = require('../models/chat');
const Agent         = require('../models/agent');
const chatService   = require('../services/chatService');
const ChatStatus    = require('../models/chat-status');
const decisionMaker = require('../services/decisionMaker');

module.exports = {
  async getChats(req, res) {
    try {
      const agentId  = req.query.agentId;
      const chats = await Chat.find({currentAgentId: agentId, status: {$eq: ChatStatus.CHAT_STATUS_ACTIVE} }).populate('messages')
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

    // Let the agent start receive chats
    return res.redirect(`/chat/start?username=${username}`);
  },
  async toggleAgentAvailability(req, res) {
    const agentId     = req.body.id;
    const isAvailable = req.body.isAvailable ? true : false;
    const agent       = await Agent.findOneAndUpdate({_id: agentId}, {isAvailable});
  
    await decisionMaker.handleAgentStatus(agentId);

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