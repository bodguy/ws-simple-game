const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

const users = new Array();

// min and max included 
function randomRange(min, max) { 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

io.on('connection', (socket) => {
    const newUser = { id: socket.id, x: randomRange(0, 700), y: randomRange(0, 500) };
    socket.emit('ping', newUser);
    socket.emit('userlist', users);
    socket.broadcast.emit('welcome', newUser);
    users.push(newUser);

    console.log(`user ${socket.id} connected`);

    socket.on('chat', (msg) => {
        socket.broadcast.emit("chat", { id: socket.id, text: msg });
    });

    socket.on('move', (msg) => {
        const index = users.findIndex(it => it.id === msg.id);
        if (index > -1) {
            users[index].x = msg.x;
            users[index].y = msg.y;
            socket.broadcast.emit("move", msg);
        }
    });

    socket.on('disconnect', () => {
        const index = users.findIndex(it => it.id === socket.id);
        if (index > -1) {
            users.splice(index, 1);
            socket.broadcast.emit('bye', socket.id);
        }

        console.log(`user ${socket.id} disconnected`);
    });
});

server.listen(8000, () => {
    console.log('listening on *:8000');
});