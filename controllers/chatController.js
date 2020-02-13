const Chat    = require('../models/chat');
const Agent   = require('../models/agent');

module.exports = {
  async getChats(req, res) {
    try {
      const agentId  = req.query.agentId;
      var chats = await Chat.find({currentAgentId: agentId}).populate('messages')
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
  }
};