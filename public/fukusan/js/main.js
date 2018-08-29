$(()=> {
  const socket = io.connect();
  socket.on('connect', () => {
    const myId = socket.id;
    const loginDialog = $('#loginDialog').get(0);
    loginDialog.showModal();

    $('#closeButton').click(() => {
      const userName = $('#userName').val();
      if(userName !== '') {
        socket.emit('join', userName);
        loginDialog.close();
      }
    });

    $('#sendButton').click(() => {
      const $chatBar = $('#chatBar');
      if($chatBar.val() !== '') {
        socket.emit('message', $chatBar.val());
        $chatBar.val('');
      }
    });

    socket.on('message', data => {
      const $chatArea = $('#chatArea');
      if (data.id === myId) {
          $('<div>').append(
            $('<p>').text(data.userName).addClass('userName')
          ).append(
            $('<p>').text(data.message).addClass('messageBody')
          ).addClass('message myMessage')
          .appendTo('#messageArea');

      } else {
        $('<div>').append(
          $('<p>').text(data.userName).addClass('userName')
        ).append(
          $('<p>').text(data.message).addClass('messageBody')
        ).addClass('message')
        .appendTo('#messageArea');
      }
    })

  });
});
