$(()=> {
  const socket = io.connect();
  socket.on('connect', () => {
    const myId = socket.id;
    const loginDialog = $('#loginDialog').get(0);
    loginDialog.showModal();

    $('#closeButton').click(() => {
      if($('#userName').val() !== '') {
        socket.emit('join', $('#userName').val());
        loginDialog.close();
      }
    });

    $('#sendButton').click(()=>{
      socket.emit('message', $('#chatBar').val());
    });

    socket.on('message', data => {
      $('#messageArea')
        .append(`<p style="color: ${data.id == myId ? 'green' : 'black'}">${data.userName}:<span style="font-size: 40px">${data.message}</span></p>`)
      ;
    });
  });
});
