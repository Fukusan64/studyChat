const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 3000;

server.listen(port, ()=> console.log(`Server listening at port ${port}`));

app.use(express.static(path.join(__dirname, 'public')));

let numUsers = 0;
let userList = {};
let typingUser = {};

io.on('connection', socket => {
  let addedUser = false;
  console.log('connection!', { referer: socket.handshake.headers.referer });
  socket.on('message', data => {
    console.log('message',{userName: socket.userName, message: data, referer: socket.handshake.headers.referer});
    io.emit('message', {
      id: socket.id,
      userName: socket.userName,
      message: data,
    });
  });

  socket.on('join', userName => {
    if(addedUser) return ;
    userList[socket.id] = userName;
    socket.userName = userName;
    numUsers += 1;
    addedUser = true;
    console.log('join', { userName, numUsers, referer: socket.handshake.headers.referer });
    socket.emit('login', {
      numUsers,
      userList,
    });
    socket.broadcast.emit('join', {
      userName,
      numUsers,
      joinedUserId: socket.id,
    });
  });
  socket.on('start typing', () => {
    console.log('start typing', { userName: socket.userName, referer: socket.handshake.headers.referer });
    typingUser[socket.id] = socket.userName;
    io.emit('update typing user', {
      typingUser,
    });
  });

  socket.on('stop typing', () => {
    console.log('stop typing', { userName: socket.userName, referer: socket.handshake.headers.referer });
    delete typingUser[socket.id];
    io.emit('update typing user', {
      typingUser,
    });
  });
  socket.on('disconnect', () => {
    if (!addedUser) return ;
    delete userList[socket.id];
    delete typingUser[socket.id];
    io.emit('update typing user', {
      typingUser,
    });
    console.log('disconnect', { userName: socket.userName, numUsers, referer: socket.handshake.headers.referer });
    numUsers -= 1;
    socket.broadcast.emit('user left', {
      userName: socket.userName,
      numUsers,
      leftUserId: socket.id,
    });
  });
});
