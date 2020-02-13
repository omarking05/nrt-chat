const express       = require('express');
const httpServer    = require('http');
const socketIo      = require('socket.io');
const mongoose      = require("mongoose");
const bodyParser    = require('body-parser');
const cookieSession = require('cookie-session');

const app         = express();
const Server      = httpServer.Server(app);
const io          = socketIo(Server);

/** Server Config */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.urlencoded());
app.use(cookieSession({
  name: 'session',
  secret: ['nrt-secret'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.set('view engine', 'ejs');
app.use(express.static('public'));
/** Server Config */

/** Database onnection start */
mongoose.connect("mongodb://"+process.env.DATABASE_HOST+"/"+process.env.DATABASE_NAME, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
.then(() => console.log("Successfully connect to MongoDB."))
.catch(err => console.error("Connection error", err));
/** Database onnection end */

module.exports = {
  app,
  Server,
  io
}