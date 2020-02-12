const Chat                = require('../models/chat');
const Message             = require('../models/message');

module.exports = {

    async saveIncomingMessageToDb(formattedMessage) {
        var existChat = await this.findChatBySenderId(formattedMessage.From);
        if (!existChat || existChat.length == 0) {
            existChat = await this.createChat({channel_type: 'whatsapp', sender_id: formattedMessage.From});
        } else {
            existChat = existChat[0];
        }
        const message = {
            'from'  : formattedMessage.from,
            'to'    : formattedMessage.to,
            'body'  : formattedMessage.body,
            'status': 'pending',
            'time'  : new Date(),
            'agent' : formattedMessage.agent,
            'chat'  : existChat
        };

        this.createMessage(message, existChat._id);

    },

    createChat (chat) {
        return Chat.create(chat).then(docTutorial => {
            console.log("\n>> Created new Chat done");
            return docTutorial;
        });
    },

    createMessage (message, chatId) {
        return Message.create(message).then(docMessage => {
            console.log("\n>> Created new message done ");
            return Chat.findByIdAndUpdate(chatId,
                { $push: { messages: docMessage._id } },
                { new: true, useFindAndModify: false }
            );
        });
    },

    findChatBySenderId (senderId) {
        return Chat.find({sender_id: senderId});
    }
};