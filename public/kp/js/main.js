$(()=> {
  const socket = io.connect();
  socket.on('connect', () => {
    const loginDialog = $('#loginDialog').get(0);
    loginDialog.showModal();

    $('#closeButton').click(() => {
      let u = $('#userName'); 
      if(u.val() !== '') {
        socket.emit('join', u.val());
        loginDialog.close();
      }
    });

    $('#sendButton').click(() => {
      let c = $('chatBar');
      if(c.val()  !== ''){
        socket.emit('message', c.val());
        c.val('');
      }
    });
  });

  socket.on('message', data => {
    let m = $('messageArea');
    m.text(m.text() + `<p>${data.userName} said: ${data.message}</p>`);
  })
});
