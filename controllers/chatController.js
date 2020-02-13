const Chat    = require('../models/chat');
const Agent   = require('../models/agent');

module.exports = {
  async getChats(_, res) {
    try {
      var chats = await Chat.find().populate('messages')
      return res.send(chats);
    } catch (error) {
      return res.send(error).code(500);
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

    req.session.username = username;

    // Let the agent start receive chats
    return res.redirect(`/chat/start?username=${username}`);
  },
  showAgent(req, res) {
    res.sendFile(path.join(__dirname + '/../views/agent.html'));
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