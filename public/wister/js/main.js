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
        if($('#chatBar').val().match(/^[\s\r\n\t]*$/)){
            alert('文字が入力されていません');
        }
        else{
            socket.emit('message', $('#chatBar').val());
        }
      });

      socket.on('message', (data) => {
        uname = data.userName;
        message = data.message;
        cnt = `<p>${uname}:<b> ${message}</b></p>`;
        $('#messageArea').append(cnt);
      });
    });
  });
  