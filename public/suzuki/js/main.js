$(()=> {
  const socket = io.connect();
  socket.on('connect', () => {
    const myId = socket.id;
    const loginDialog = $('#loginDialog').get(0);
    let date;
    let chatNum = 0;
    let area = document.getElementById('messageArea');
    let scrollHeight;
    loginDialog.showModal();

    $('#closeButton').click(() => {
      if($('#userName').val() !== '') {
        socket.emit('join', $('#userName').val());
        loginDialog.close();
      }
    });

    const buttomScroll = () => {
      scrollHeight = area.scrollHeight;
      area.scrollTop = scrollHeight;
    }

    if(area.scrollTop < scrollHeight){//if文の条件間違ってるよ
      console.log('aaaaaa');
      $('#messageArea')
        .append(`<button id='downButton'>最後のログへ</button>`)
      ;
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
        .append(`<p style="color: ${data.id == myId ? 'green' : 'black'}">${chatNum}. ${data.userName} ${date.toLocaleString()}</br><span style="font-size: 30px; margin-left: 15px;">${data.message}</span></p><hr>`)
      ;
    });

    socket.on('join', data => {
      $('#messageArea')
        .append(`<p style="color: lightgreen;">${data.userName}が入室しました。現在${data.numUsers}人。</p>`)
      ;
      buttomScroll();
    });

    socket.on('login', data => {
      $('#messageArea')
        .append(`<p style="color: lightgreen;">あなたが入室しました。現在${data.numUsers}人。</p>`)
      ;
      buttomScroll();
    });

    socket.on('user left', data => {
      $('#messageArea')
        .append(`<p style="color: lightgreen;">${data.userName}が退室しました。現在${data.numUsers}人。</p>`)
      ;
      buttomScroll();
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
  });
});
