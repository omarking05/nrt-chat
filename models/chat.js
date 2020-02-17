const mongoose = require("mongoose");
const ChatStatus = require('./chat-status');

const Chat = mongoose.model(
    "Chat",
    new mongoose.Schema({
        channelType: String,
        senderId: String,
        currentAgentId: String,
        status: {
            type: String,
            default: ChatStatus.CHAT_STATUS_UNASSIGNED
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

Chat.getOldestUnassignedChat = async function() {
    return this.findOne({status: ChatStatus.CHAT_STATUS_UNASSIGNED}).order({'createdAt': 1}).populate('messages')
};

Chat.assignAgentId = async function(agentId) {
    return this.updateOne({_id: this._id}, {currentAgentId: agentId});
};

module.exports = Chat;