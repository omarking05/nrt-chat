var socket = {};

window.addEventListener('load', function () {
    // Here we receive incoming whatsapp message
    socket.on('wa_message', function (data) {
        appendTextMessage(data);
    });
    loadListChats();
});

function appendTextMessage(data) {
    var idElement = 'wa-chat-' + data.senderId;
    var waMessageElement = document.getElementById(idElement);
    if (!waMessageElement) {
        var waMessageElement = document.createElement('div');
        waMessageElement.id = idElement;
        waMessageElement.className = 'wa-chat';

        var headingElement = document.createElement('span');
        headingElement.innerText = 'Message from: ' + data.senderId;
        headingElement.className = 'lead d-block mt-2';

        waMessageElement.appendChild(headingElement);

        document.getElementById('wa-list-chats').appendChild(waMessageElement)
    }

    var newMessage = document.createElement('span');
    newMessage.id = data.messageSid;
    newMessage.className = 'd-block';
    var newMessageIcon;
    if (data.isAgent) {
        newMessage.className += ' message-agent';
        newMessageIcon = document.createElement('span');
        newMessageIcon.className = 'fas fa-user mr-2';
    } else {
        newMessage.className += ' message-visitor';
        newMessageIcon = document.createElement('span');
        newMessageIcon.className = 'fas fa-user mr-2';
    }
    var newMessageText = document.createElement('span');
        newMessageText.innerText = data.body;

    var newMessageTime = document.createElement('span');
        newMessageTime.className = 'message-time';
        newMessageTime.innerText = new Intl.DateTimeFormat('nl-NL', {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',}).format(new Date(data.time))

    newMessage.appendChild(newMessageIcon);
    newMessage.appendChild(newMessageText);
    newMessage.appendChild(newMessageTime);

    var waFormReply;
    if (!document.getElementById('form-reply-' + data.senderId)) {
        waFormReply = waMessageElement.appendChild(buildReplyForm(data.senderId));
    } else {
        waFormReply = document.getElementById('form-reply-' + data.senderId);
    }

    waMessageElement.insertBefore(newMessage, waFormReply);
}

function buildReplyForm(userId) {
    // TODO Now I use phone number as a userId
    var replyButton = document.createElement('button');
        replyButton.type = 'button';
        replyButton.id = 'reply-button-' + userId;
        replyButton.className = 'btn btn-primary reply-message-button';
        replyButton.innerText = 'Reply';
        replyButton.onclick = function() {
            var textElement = document.getElementById('reply-message-input-' + userId);
            if (!textElement) {
                return false;
            }
            sendReplyToServer(textElement.value, userId);
            textElement.value = '';
        };

    var closeButton             = document.createElement('button');
        closeButton.type        = 'button';
        closeButton.className   = 'btn btn-primary ml-2';
        closeButton.innerText   = 'Close chat';
        closeButton.id          = 'close-chat-' + userId;

        closeButton.onclick     = function() {
            fetch('/chat/close', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({'userId': userId})
            }).then(function(response) {
                // Update status of chat
                disableChat(userId);
            }).catch(function(error) {
                console.log(error);
                // enableChat(userId);
            });

            return false;
        };

    var input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control reply-message';
        input.id = 'reply-message-input-' + userId;
        input.placeholder = 'Reply text';

    var label = document.createElement('label');
        label.for = 'reply-message-input-' + userId;

    var div = document.createElement('div');
        div.className = 'form-group';

    var form = document.createElement('form');
        form.id = 'form-reply-' + userId;
        form.className = 'mt-3';
        form.onsubmit = function() {
            replyButton.click();
            return false;
        };


    div.appendChild(label);
    div.appendChild(input);
    form.appendChild(div);
    form.appendChild(replyButton);
    form.appendChild(closeButton);

    return form;
}


function disableChat(userId) {
    $('#wa-chat-\\' + userId).fadeOut(300, function() {
        $(this).remove();
    });
}

function enableChat(userId) {
    document.getElementById('wa-chat-' + userId).className.replace('disabled-chat', '');
}

function sendReplyToServer(text, userId) {
    // Send text of message into server
    socket.emit('wa_reply', {
        text: text,
        userId: userId,
        agentId: 1
    });
}

function buildChatBlock(chat) {
    if (chat.messages.length) {
        chat.messages.forEach(function(message) {
            message.senderId = chat.senderId;
            appendTextMessage(message);
        })
    }
}
