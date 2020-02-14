const mongoose = require("mongoose");

const Chat = mongoose.model(
    "Chat",
    new mongoose.Schema({
        channelType: String,
        senderId: String,
        currentAgentId: String,
        // unassigned  - Visitor send message (no one agent assigned)
        // active  - Visitor send message and agent assigned
        // closed - Agent clicked to close button type: String,
        status: {
            type: String,
            default: "unassigned"
        },
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account"
        },
        messages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }],
        createdAt: {
            type: Date,
            default: Date.now()
        }
    })
);

module.exports = Chat;