var socket = io('http://localhost:3000');

window.addEventListener('load', function () {
    // Here we receive incoming whatsapp message
    socket.on('wa_message', function (data) {
        appendTextMessage(data);
    });
});

function appendTextMessage(data) {
    var idElement = 'wa-message-' + data.from;
    var waMessageElement = document.getElementById(idElement);
    if (!waMessageElement) {
        var waMessageElement = document.createElement('div');
        waMessageElement.id = idElement;
        waMessageElement.className = 'wa-message';

        var headingElement = document.createElement('span');
        headingElement.innerText = 'Message from: ' + data.from;
        headingElement.className = 'lead d-block mt-2';

        waMessageElement.appendChild(headingElement);

        document.getElementById('wa-list-messages').appendChild(waMessageElement)
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
    if (!document.getElementById('form-reply-' + data.from)) {
        waFormReply = waMessageElement.appendChild(buildReplyForm(data.from));
    } else {
        waFormReply = document.getElementById('form-reply-' + data.from);
    }

    waMessageElement.insertBefore(newMessage, waFormReply);
}

function buildReplyForm(userId) {
    // TODO Now I use phone number as a userId
    var button = document.createElement('button');
        button.type = 'button';
        button.id = 'reply-button-' + userId;
        button.className = 'btn btn-primary reply-message-button';
        button.innerText = 'Reply';
        button.onclick = function() {
            var textElement = document.getElementById('reply-message-input-' + userId);
            if (!textElement) {
                return false;
            }
            sendReplyToServer(textElement.value, userId);
            textElement.value = '';
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
            button.click();
            return false;
        };


    div.appendChild(label);
    div.appendChild(input);
    form.appendChild(div);
    form.appendChild(button);

    return form;
}

function sendReplyToServer(text, userId) {
    socket.emit('wa_reply', {
        text: text,
        userId: userId,
        agentId: 1
    });
}
