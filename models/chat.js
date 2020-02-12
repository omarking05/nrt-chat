const mongoose = require("mongoose");

const Chat = mongoose.model(
    "Chat",
    new mongoose.Schema({
        channel_type: String,
        sender_id: String,
        messages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }]
    })
);

module.exports = Chat;