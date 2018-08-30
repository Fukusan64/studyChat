$(()=> {
  const socket = io.connect();
  socket.on('connect', () => {
    const myId = socket.id;
    const loginDialog = $('#loginDialog').get(0);
    let date;
    let chatNum = 0;
    let area = document.getElementById('messageArea');
    let scrollHeight;
    let timer = false;
    loginDialog.showModal();

    $('#closeButton').click(() => {
      if($('#userName').val() !== '') {
        socket.emit('join', $('#userName').val());
        loginDialog.close();
        $('#chatBar').focus();
      }
    });

    $('#messageArea').scroll(() => {
      if(timer !== false){
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        appearScrollButton();
      }, 200);
    });

    const scrollBottom = () => {
      scrollHeight = area.scrollHeight;
      area.scrollTop = scrollHeight;
    };

    const appearScrollButton = () => {
      if(area.scrollHeight - Math.round(area.scrollTop) > area.clientHeight){
        $('#downButton').show();
      }
      else{
        $('#downButton').hide();
      }
    };

    $('#sendButton').click(() => {
      const message = $("#chatBar").val();
      if(message != '') {
        socket.emit('message', message);
        $("#chatBar").val('');
      }
    });

    socket.on('message', data => {
      date = new Date;
      chatNum += 1;
      $('#messageArea')
        .append(`<p style="color: ${data.id == myId ? '#a8da44' : '#444'}">${chatNum}. ${data.userName} ${date.toLocaleString()}</br><span style="font-size: 30px; margin-left: 15px;">${data.message}</span></p><hr>`)
      ;
      scrollBottom();
    });

    socket.on('join', data => {
      $('#messageArea')
        .append(`<p style="color: #f1c550;">${data.userName}が入室しました。現在${data.numUsers}人。</p>`)
      ;
      scrollBottom();
    });

    socket.on('login', data => {
      $('#messageArea')
        .append(`<p style="color: #f1c550;">あなたが入室しました。現在${data.numUsers}人。</p>`)
      ;
      scrollBottom();
    });

    socket.on('user left', data => {
      $('#messageArea')
        .append(`<p style="color: #f1c550;">${data.userName}が退室しました。現在${data.numUsers}人。</p>`)
      ;
      scrollBottom();
    });

    $('#chatBar').keydown(e => {
      if(event.ctrlKey){
        if(e.keyCode === 13){
          $('#sendButton').trigger('click');
        }
      }
    });

    $('#userName').keydown(e => {
      if(e.keyCode === 13){
        $('#closeButton').trigger('click');
      }
    });

    $('#downButton').click(() => {
      scrollBottom();
    })
  });
});
