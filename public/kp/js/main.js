$(()=> {
  const socket = io.connect();
  socket.on('connect', () => {
    const loginDialog = $('#loginDialog').get(0);
    loginDialog.showModal();

    jc('#closeButton').click(() => {
      var t = jc('#userName').val();
      if(t !== '') {
        socket.emit('join', t);
        loginDialog.close();
      }
    });

    jc('#sendButton').click(() => {
      var t = jc('#chatBar').val();
      if(t  !== ''){
        socket.emit('message', t);
        jc('#chatBar').val('');
      }
    });
  });

  socket.on('message', data => {
    if (data.message.includes(':thinking:'))
    {
      data.message = data.message.replace(':thinking:', '\u{1f914}');
    }
    jc('#messageArea').append(`<p>${data.userName} said: ${data.message}</p>`);
  })
});
