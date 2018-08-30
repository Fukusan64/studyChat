$( () => {
        const socket = io.connect();
        const barLineHeight = parseInt($('#chatBar').css('lineHeight'));
        const barMaxHeight = parseInt($('#inputWrapper').css('maxHeight'));
        let hiddenNotice = true;
        let msgAreaScrollTimer = false;
        let myId;

        let userList = {};

        $('#chatForm').submit( (e) => {
          e.preventDefault();

          let msg = $('#chatBar').val();
          if(!isBlank(msg)) {
            socket.emit('message', msg);
            $('#chatBar').val('');
          }
          resizeChatBar();
        });

        $('#chatBar').on('keypress', (e) => {
          if(e.which === 13 && !e.shiftKey) {
            e.preventDefault();
            $('#chatForm').submit();
          }
        });

        $('#chatBar').on('input', (e) => {
          resizeChatBar();
        });


        socket.on('connect', () => {
          myId = socket.id;
          const loginDialog = $('#loginDialog').get(0);
          resizeChatBar();
          loginDialog.showModal();


          $('#loginForm').submit((e) => {
            e.preventDefault();
              if(!isBlank($('#userName').val())) {
                  socket.emit('join', $('#userName').val());
                  loginDialog.close();
              }
          });

        });

        socket.on(`login`, (data) => {
          userList = data.userList;
          refreshMembersList(data.numUsers);
        });

        socket.on('join', (data) => {
          userList[data.joinedUserId] = data.userName;
          refreshMembersList(data.numUsers);
        });

        socket.on('user left', (data) => {
          delete userList[data.leftUserId];
          refreshMembersList(data.numUsers);
        });

        socket.on('message', (data) => {
          let ai = $('#messageArea').innerHeight();
          let as = $('#messageArea').scrollTop();
          let ash = $('#messageArea').get(0).scrollHeight;

          formatMessage(data).appendTo('#messageArea');

          if(canScroll($('#messageArea')) ) {
            if(ash - as <= ai) $('#messageArea').get(0).scrollTop = ash;
            else noticeNew();
          }
        });

        $('#messageArea').on('scroll', () => {
          if(msgAreaScrollTimer !== false) {
            clearTimeout(msgAreaScrollTimer);
          }
          msgAreaScrollTimer = setTimeout(() => {
            if(!hiddenNotice) {
              let ai = $('#messageArea').innerHeight();
              let as = $('#messageArea').scrollTop();
              let ash = $('#messageArea').get(0).scrollHeight;
              if(ash - as <= ai) hideNotice();
              msgAreaScrollTimer = false;
            }
          }, 200);
        });

        $('#noticeBG').click((e) => {
          $('#messageArea').get(0).scrollTop = $('#messageArea').get(0).scrollHeight;
          hideNotice();
        });

        $('#members').click((e) => {
          $('#container').toggle();
        });


        function formatMessage(data) {

          var msg = isBlank(data.message) ? ' ' : data.message;
          let msghtml = $('<p class="text">').text(msg);
          msg = msghtml.html().replace(/\n/gi,'<br>');
          msghtml.html(msg);
          let namehtml = $('<p class="name">').text(isBlank(data.userName) ? 'BlankMan' : data.userName);

          let text = $('<li class="messages">');
          if(isMine(data)) text.addClass('myChat');
          else text.addClass('otherChat');
          text.append(namehtml);
          text.append(msghtml);
          return text;
        }

        function isMine(data) {
          return data.id === myId;
        }

        function isBlank(value) {
          let withoutBlank = value.replace(/[\t\s ]/g,'');
          return value === '' || withoutBlank.length === 0;
        }

        function noticeNew() {
          //console.log('Recieved the new message');

          //let text = $('<span id="notice">').text('新しいメッセージが届きました');
          ///$('#noticeBG').html(text);
          $('#noticeBG').slideDown(500);
          hiddenNotice = false;
        }

        function hideNotice() {
          $('#noticeBG').fadeOut(500);
          hiddenNotice = true;
        }

        function canScroll(query) {
          return query.innerHeight() < query.get(0).scrollHeight;
        }

        function resizeChatBar() {
          let lines = ($('#chatBar').val() + '\n').match(/\n/g).length;
          $('#chatBar').height(barLineHeight * lines > barMaxHeight ? barMaxHeight : barLineHeight * lines);
        }

        function refreshMembersList(numUsers) {
          $('#members > .number > span').text(`${numUsers}`);
          const area = $('#memberListArea');
          area.html('');
          for([id, name] of Object.entries(userList)) {
            console.log(name);
            if(name.length > 32) {
              name = name.slice(0,32) + '...';
            }
            let text = $('<li class="member">').text(`${name}@${id}`);
            area.append(text);
          }
        }
});
