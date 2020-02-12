const mongoose = require("mongoose");

const Chat = mongoose.model(
    "Chat",
    new mongoose.Schema({
        channelType: String,
        senderId: String,
        currentAgentId: String,
        messages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }]
    })
);

module.exports = Chat;