require('dotenv-safe').config();

const bodyParser        = require('body-parser');
const routes            = require('./routes');
const {app, Server, io} = require('./config');
const port              = process.env.APP_PORT;


/** Server Config */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
/** Server Config */

/** Routes Config */
app.use('/', routes);
/** Routes Config */

/** Socket io connection */
io.on('connection', (socket) => {
  socket.on('chat message', function(msg) {
    socket.emit('send_response', ++msg)
  });
});
/** Socket io connection */

Server.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});




