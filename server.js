
// Grundgerüst für Elias-Chat mit Benachrichtigungen und Admin-Funktionen

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// In-Memory-Datenbank für Nutzer und Rechte
let users = {}; // { socketId: { username, isAdmin, permissions: [] } }

io.on('connection', (socket) => {
    console.log(`Neuer Nutzer verbunden: ${socket.id}`);

    // Nutzer registrieren
    socket.on('register', (username) => {
        users[socket.id] = { username, isAdmin: false, permissions: [] };
        console.log(`${username} registriert (${socket.id})`);
    });

    // Nachricht empfangen und an alle senden + Benachrichtigung auslösen
    socket.on('send_message', (msg) => {
        console.log(`Nachricht von ${users[socket.id]?.username}: ${msg}`);
        io.emit('new_message', {
            user: users[socket.id]?.username || 'Unbekannt',
            text: msg
        });
        io.emit('notify', `Neue Nachricht von ${users[socket.id]?.username}`);
    });

    // Adminrechte vergeben (einzelne Rechte)
    socket.on('grant_permission', ({ targetSocketId, permission }) => {
        const admin = users[socket.id];
        if (admin?.isAdmin) {
            if (users[targetSocketId]) {
                users[targetSocketId].permissions.push(permission);
                socket.emit('info', `Recht '${permission}' wurde an ${users[targetSocketId].username} vergeben.`);
            } else {
                socket.emit('error', 'Zielnutzer nicht gefunden.');
            }
        } else {
            socket.emit('error', 'Keine Adminrechte.');
        }
    });

    // Adminstatus setzen (nur zum Testen)
    socket.on('set_admin', () => {
        if (users[socket.id]) {
            users[socket.id].isAdmin = true;
            socket.emit('info', 'Du bist jetzt Admin.');
        }
    });

    socket.on('disconnect', () => {
        console.log(`Nutzer getrennt: ${socket.id}`);
        delete users[socket.id];
    });
});

app.get('/', (req, res) => {
    res.send('Elias-Chat-Server läuft.');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
