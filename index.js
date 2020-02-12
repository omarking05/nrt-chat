require('dotenv-safe').config();

const bodyParser        = require('body-parser');
const routes            = require('./routes');
const handleSocket      = require('./controllers/socketController');
const {app, Server, io} = require('./config');
const express           = require('express')
const port              = process.env.APP_PORT;

/** Server Config */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
/** Server Config */

/** Routes Config */
app.use('/', routes);
/** Routes Config */

/** Socket io connection */
io.on('connection', (socket) => {
  handleSocket(socket);
});
/** Socket io connection */

Server.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});




