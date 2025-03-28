const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

const players = new Map();

// min and max included 
function randomRange(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

io.on('connection', (socket) => {
    const newPlayer = { id: socket.id, x: randomRange(0, 700), y: randomRange(0, 500) };
    socket.emit('ping', newPlayer);
    socket.emit('userlist', Array.from(players, (_, v) => v));
    socket.broadcast.emit('welcome', newPlayer);
    players.set(socket.id, newPlayer);

    console.log(`player ${socket.id} connected`);

    socket.on('chat', (msg) => {
        console.log(`${socket.id}: ${msg}`);
        socket.broadcast.emit("chat", { id: socket.id, text: msg });
    });

    socket.on('move', (msg) => {
        const p = players.get(msg.id);

        if (p) {
            p.x = msg.x;
            p.y = msg.y;
            socket.broadcast.emit("move", msg);
        }
    });

    socket.on('disconnect', () => {
        const p = players.get(socket.id);

        if (p) {
            players.delete(p.id);
            socket.broadcast.emit('bye', socket.id);
        }

        console.log(`player ${socket.id} disconnected`);
    });
});

server.listen(8000, () => {
    console.log('listening on *:8000');
});