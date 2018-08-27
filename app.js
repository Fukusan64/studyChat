const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 3000;

server.listen(port, ()=> console.log(`Server listening at port ${port}`));

app.use(express.static(path.join(__dirname, 'public')));

let numUsers = 0;

io.on('connection', socket => {
  let addedUser = false;
  console.log('connection!', { referer: socket.handshake.headers.referer });
  socket.on('message', data => {
    console.log('message',{userName: socket.userName, message: data, referer: socket.handshake.headers.referer});
    socket.broadcast.emit('message', {
      userName: socket.userName,
      message: data,
    });
  });

  socket.on('join', userName => {
    if(addedUser) return ;
    socket.userName = userName;
    numUsers += 1;
    addedUser = true;
    console.log('join', { userName, numUsers, referer: socket.handshake.headers.referer });
    socket.emit('login', {
      numUsers,
    });
    socket.broadcast.emit('join', {
      userName,
      numUsers,
    });
  });
  socket.on('start typing', () => {
    console.log('start typing', { userName: socket.userName, referer: socket.handshake.headers.referer });
    socket.broadcast.emit('start typing', {
      userName: socket.userName,
    });
  });

  socket.on('stop typing', () => {
    console.log('stop typing', { userName: socket.userName, referer: socket.handshake.headers.referer });
    socket.broadcast.emit('stop typing', {
      userName: socket.userName,
    });
  });
  socket.on('disconnect', () => {
    if (!addedUser) return ;
    console.log('disconnect', { userName: socket.userName, numUsers, referer: socket.handshake.headers.referer });
    numUsers -= 1;
    socket.broadcast.emit('user left', {
      userName: socket.userName,
      numUsers,
    });
  });
});
