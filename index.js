require('dotenv-safe').config();


const routes            = require('./routes');
const accountRoutes     = require('./routes/account');
const agentRoutes       = require('./routes/agent');
const chatRoutes        = require('./routes/chat');
const webhookRoutes     = require('./routes/webhook');
const handleSocket      = require('./controllers/socketController');
const {app, Server, io} = require('./config');
const port              = process.env.APP_PORT;


/** Routes Config */
app.use('/', routes);

app.use('/webhook', webhookRoutes);

app.use('/control/account/', accountRoutes);

app.use('/control/agent/', agentRoutes);

app.use('/chat/', chatRoutes);
/** Routes Config */

/** Socket io connection */
io.on('connection', (socket) => {
  handleSocket(socket);
});
/** Socket io connection */



Server.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});




