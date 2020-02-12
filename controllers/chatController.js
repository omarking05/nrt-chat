const Chat                = require('../models/chat');
const Message             = require('../models/message');

module.exports = {

    async getChats(request, reply) {
        try {
            var chats = await Chat.find().populate("messages")
            return reply.send(chats);
        } catch (error) {
            return reply.send(error).code(500);
        }

    }
};