const mongoose = require("mongoose");

const Message = mongoose.model(
    "Message",
    new mongoose.Schema({
        from: String,
        to: String,
        body: String,
        status: String,
        time: String,
        agent: String,
        chat: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        }
    })
);

module.exports = Message;