$(()=> {
  const socket = io.connect();
  socket.on('connect', () => {
    const loginDialog = $('#loginDialog').get(0);
    loginDialog.showModal();

    $('#closeButton').click(() => {
      if($('#userName').val() !== '') {
        socket.emit('join', $('#userName').val());
        loginDialog.close();
      }
    });

    $('#sendButton').click(() => {
      if($('#chatBar').val() !== '')
      {
        socket.emit('message', $('#chatBar').val());
        $('#chatBar').val('');
      }
    });
  });

  socket.on('message', data => {
    $('#messageArea').text(`${data.userName} said: ${data.message}`);
  });
});
