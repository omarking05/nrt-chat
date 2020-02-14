const mongoose = require("mongoose");

const Agent = mongoose.model(
    "Agent",
    new mongoose.Schema({
        name: String,
        username: String,
        senderId: String,
        maxNumberOfChats: Number,
        currentNumberOfChats: {
            type: Number,
            default: 0
        },
        isAvailable: Boolean,
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account"
        }
    })
);

module.exports = Agent;