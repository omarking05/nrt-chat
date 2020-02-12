const mongoose = require("mongoose");

const Chat = mongoose.model(
    "Chat",
    new mongoose.Schema({
        channel_type: String,
        sender_id: String
    })
);

module.exports = Chat;