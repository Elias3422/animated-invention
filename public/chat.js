// Chat-Client mit Benachrichtigungen
const socket = io();

function sendMessage() {
    const msg = document.getElementById('message').value;
    socket.emit('send_message', msg);
    document.getElementById('message').value = '';
}

socket.on('new_message', (data) => {
    const chatBox = document.getElementById('chat-box');
    const msgElement = document.createElement('div');
    msgElement.textContent = `${data.user}: ${data.text}`;
    chatBox.appendChild(msgElement);
});

// Benachrichtigung anzeigen
socket.on('notify', (msg) => {
    alert(msg);
});