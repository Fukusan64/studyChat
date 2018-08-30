$(()=> {
  const socket = io.connect();
  socket.on('connect', () => {
    const loginDialog = $('#loginDialog').get(0);
    loginDialog.showModal();

    $('#closeButton').click(() => {
      var u = $('#userName'); 
      if(u.val() !== '') {
        socket.emit('join', u.val());
        loginDialog.close();
      }
    });

    $('#sendButton').click(() => {
      var c = $('#chatBar');
      if(c.val()  !== ''){
        socket.emit('message', c.val());
        c.val('');
      }
    });
  });

  socket.on('message', data => {
    var m = $('#messageArea');
    m.append(`<p>${data.userName} said: ${data.message}</p>`);
  })
});
