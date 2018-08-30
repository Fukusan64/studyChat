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
      var t = c.val();
      if(t  !== ''){
        socket.emit('message', t);
        c.val('');
      }
    });
  });

  socket.on('message', data => {
    var m = $('#messageArea');
    if (data.message.includes(':thinking:'))
    {
      data.message = data.message.replace(':thinking:', '\u{1f914}');
    }
    m.append(`<p>${data.userName} said: ${data.message}</p>`);
  })
});
