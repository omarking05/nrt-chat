const routes          = require('express').Router();
const chatController  = require('../controllers/chatController');

// Home page
routes.get('/', (_, res) => {
  res.redirect('/login');
});

routes.get('/login', (_, res) => {
  res.render('chat/login');
});

routes.get('/chats', chatController.getChats);

module.exports = routes;