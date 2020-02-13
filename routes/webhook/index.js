const routes              = require('express').Router();
const { io }              = require('../../config');
const webhookController   = require('../../controllers/webhookController');

routes.post('/twilio', webhookController.twilio);

routes.post('/status', webhookController.twilio);

module.exports = routes;