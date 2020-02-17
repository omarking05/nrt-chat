const AccountController   = require('../../controllers/accountController');
const routes              = require('express').Router();

routes.get('/new', AccountController.createAccountPage);

routes.post('/', AccountController.createAccountLogic);

routes.post('/account-update', AccountController.updateAgentLogic);

routes.get('/:id?', AccountController.getAllAccounts);

routes.get('/:id/chats', AccountController.getAllChats);

routes.post('/:id/chat/assign', AccountController.assignChatToAgent);


module.exports = routes;