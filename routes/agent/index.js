const AgentController     = require('../../controllers/agentController');
const routes              = require('express').Router();

routes.get('/new', AgentController.createAgentPage);

routes.post('/', AgentController.createAgentLogic);

routes.post('/agent-update', AgentController.updateAgentLogic);

routes.get('/:id*?', AgentController.getAllAgents);

module.exports = routes;