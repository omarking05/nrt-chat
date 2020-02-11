require('dotenv-safe').config();

const express     = require('express');
const bodyParser  = require('body-parser');
const httpServer  = require('http');
const socketIo    = require('socket.io');
const routes      = require('./routes');


const app         = express();
const Server      = httpServer.Server(app);
const io          = socketIo(Server);
const port        = process.env.APP_PORT;


/** Server Config */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
/** Server Config */


/** Routes Config */
app.use('/', routes);
/** Routes Config */

Server.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});



