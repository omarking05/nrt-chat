const routes              = require('express').Router();
const chatController      = require('../../controllers/chatController');

routes.get('/chats', chatController.getChats);

routes.post('/login', chatController.loginAgent);

routes.get('/start', chatController.startChat);

routes.post('/availability', chatController.toggleAgentAvailability);

routes.post('/close', chatController.closeChat);

module.exports = routes;