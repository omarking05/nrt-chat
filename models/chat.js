const mongoose                      = require("mongoose");
const { CHAT_STATUS_UNASSIGNED }    = require('./chat-status');

const Chat = mongoose.model(
    "Chat",
    new mongoose.Schema({
        channelType: String,
        senderId: String,
        currentAgentId: String,
        // unassigned  - Visitor send message (no one agent assigned)
        // active  - Visitor send message and agent assigned
        // closed - Agent clicked to close button type: String,
        // pending - Visitor send message and all agents are not available type: String,
        status: {
            type: String,
            default: CHAT_STATUS_UNASSIGNED
        },
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account"
        },
        messages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }]
    })
);

module.exports = Chat;