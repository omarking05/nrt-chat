const Chat                = require('../models/chat');
const Message             = require('../models/message');

module.exports = {
    async getChats(request, reply) {
        await Chat.find()
            .populate("messages")
    }
};