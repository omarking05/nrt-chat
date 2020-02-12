const routes              = require('express').Router();
const chatController      = require('../controllers/chatController');

routes.get('/', (_, res) => {
  res.send('Hey There.');
});

routes.post('/chat', chatController.postChat);

routes.get('/agent', chatController.showAgent);

routes.get('/chats', chatController.getChats);

module.exports = routes;