const mongoose = require("mongoose");

const Account = mongoose.model(
    "Account",
    new mongoose.Schema({
        name: String,
        waNumber: String,
        chats: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        }],
        agents: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent"
        }]
    })
);

module.exports = Account;