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

    $('#sendButton').click(function(){
      const message = $("#chatBar").val();
      if(message != '') {
        socket.emit('message', message);
      }
    });
  });
});
