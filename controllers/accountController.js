const Account = require('../models/account');
const Agent   = require('../models/agent');
const Chat    = require('../models/chat');

module.exports = {
  async createAccountPage(_, res) {
    const agents = await Agent.find();
    return res.render('account/create', {
      agents
    });
  },
  async createAccountLogic(req, res) {
    const name      = req.body.name;
    const waNumber  = req.body.waNumber;
    const agentsIds = req.body.agents;

    // First create the account
    const account   = await Account.create({name, waNumber});

    if (Array.isArray(agentsIds)) {
      // Then loop over agents
      for (const agentId of agentsIds) {
        // get agent
        const agent = await Agent.findByIdAndUpdate(agentId, {account: account});
        // add agent to account
        account.agents.push(agent);
      }
    } else if (typeof agentsIds === 'string') {
      // get agent
      const agent = await Agent.findByIdAndUpdate(agentsIds, {account: account});
      // add agent to account
      account.agents.push(agent);
    }

    // Save account
    account.save();

    res.redirect('/control/account');
  },
  async updateAgentLogic(req, res) {
    const name      = req.body.name;
    const waNumber  = req.body.waNumber;
    let agentsIds   = req.body.agents;

    if (agentsIds && !Array.isArray(agentsIds)) {
      agentsIds = [agentsIds];
    }

    // First create the account
    const account   = await Account.findOneAndUpdate({_id: req.body.id}, {name, waNumber});

    // Initialize new agents in DB
    for(agentId of account.agents) {
      const agent = await Agent.findById(agentId);
      agent.account = null;
      agent.save();
    }

    // Initialize new agents in account
    account.agents = [];

    // Then loop over agents
    for (const agentId of agentsIds) {
      // get agent
      const agent = await Agent.findOneAndUpdate({_id: agentId}, {account: account});
      // add agent to account
      account.agents.push(agent);
    }

    // Save account
    account.save();
    res.redirect('/control/account');
  },
  async getAllAccounts(req, res) {
    const accountId = req.params.id;
    if (accountId) {
      const account = await Account.findById(accountId);
      const agents  = await Agent.find();
      return res.render('account/update', {
        account,
        agents
      });
    } else {
      const accounts = await Account.find()
      return res.render('account/list', {
        accounts
      });
    }
  },
  async getAllChats(req, res) {
    const accountId = req.params.id;
    if (accountId) {
      const account = await Account.findById(accountId);
      const agents  = await Agent.find({account: account});
      var agentIds = [];
      for (const agent of agents) {
        agentIds.push(agent._id);
      }
      // const chats   = await Chat.find({currentAgentId: {$in: agentIds}}).populate('currentAgent');
      const chats   = await Chat.find().populate('currentAgent');
        // return res.send(chats);
      accounts = [accountId];
      return res.render('account/chats', {chats, agents, accounts});
    } else {
      const accounts = await Account.find();
      return res.render('account/list', {
        accounts
      });
    }
  },
  async assignChatToAgent(req, res) {
    const agentId = req.body.agentId;
    const chatId = req.body.chatId;
    const accountId = req.params.id;

    const agent = await Agent.findById(agentId);
    const chat = await Chat.findById(chatId);

    chat.currentAgentId = agent.id;
    chat.currentAgent = agent;

    chat.save();
    return res.redirect('/control/account/' + accountId + '/chats');
  }
};