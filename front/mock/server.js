const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
cors: {
    origin: '*',
  }
});

const chatSocket = io.of('/chat');

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

chatSocket.on('connection', (socket) => {
    console.log('a user connected');
    console.log(socket.handshake);
    console.log(socket.handshake.query);
    // socket.disconnect();
    // io.of('chat').on
    socket.on('join', (room, callback) => {
      console.log('join');
      console.log(room);
      console.log(room.roomID);
      // let roomO = JSON.parse(room);
      socket.join(room.roomID);
      if (room.password === 'lol') {
        callback({error: "password can't be 'lol'"});
      } else {
        callback(
          {
            roomID: room.roomID,
            messages: [],
            name: "Channel 1",
            isChannel: true
          }

        );
      }

    })
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    socket.on('message', (msg) => {
        let msgO = JSON.parse(msg);
        console.log(msgO);
        console.log('message: ' + msgO.roomID);
        chatSocket.to(msgO.roomID).emit('message', msgO);
    });

});

server.listen(6969, () => {
  console.log('listening on *:6969');
});
