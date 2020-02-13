const shortid = require('shortid');
const Agent   = require('../models/agent');


async function createAgent(req) {
  const agent = {
    name: req.body.agentName,
    username: req.body.username,
    maxNumberOfChats: req.body.maxNumberOfChats,
    senderId: shortid.generate()
  };
  return Agent.create(agent);
}

async function updateAgent(req) {
  const agent = {
    name: req.body.agentName,
    username: req.body.username,
    maxNumberOfChats: req.body.maxNumberOfChats
  };
  return Agent.findOneAndUpdate({
    _id: req.body.id
  }, agent);
}

module.exports = {
  createAgentPage(_, res) {
    res.render('agent/create');
  },
  async createAgentLogic(req, res) {
    const agent = await createAgent(req);
    res.redirect('/control/agent');
  },
  async updateAgentLogic(req, res) {
    const agent = await updateAgent(req);
    res.redirect('/control/agent');
  },
  async getAllAgents(req, res) {
    const agentId = req.params.id;
    if (agentId) {
      const agent = await Agent.findById(agentId)
      return res.render('agent/update', {
        agent
      });
    } else {
      const agents = await Agent.find()
      return res.render('agent/list', {
        agents
      });
    }
  }
};