const mongoose = require("mongoose");

const Message = mongoose.model(
    "Message",
    new mongoose.Schema({
        type: String,
        body: String,
        numMedia: Number,
        accountSid: String,
        apiVersion: String,
        time: String,
        isAgent: Boolean,
        agentId: String, // Relation with agent
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        }
    })
);

module.exports = Message;