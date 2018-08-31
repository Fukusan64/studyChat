$(()=> {
    const socket = io.connect();
    socket.on('connect', () => {
      const myId = socket.id;
      const loginDialog = $('#loginDialog').get(0);
      loginDialog.showModal();
      let uList = {};
      $('#closeButton').click(() => {
        if($('#userName').val().match(/^[\s\r\n\t]*$/)) {
            alert('文字が入力されていません');
        }
        else{
            username = $('#userName').val();
            username = username.replace(/.*/,'<a target="_blank" href = "https://twitter.com/wister_fl">$&</a>');
            socket.emit('join', username);
            loginDialog.close();
        }
      });

      $('#sendButton').click(() => {
        if($('#chatBar').val().match(/^[\s\r\n\t]*$/)){
            alert('文字が入力されていません');
        }
        else{
            let val = $('#chatBar').val();
            val = val.replace(/</g, '&lt;');
            val = val.replace(/>/g, '&gt;');
            val = val.replace(/\n/g, '<br>');
            ma = val.match(/https?[\w\S]+/);
            if(ma){
              val = val.replace(ma[0],`<a target="_blank" href="$&">${ma[0].match(/\/\/[a-z0-9:\.]+\//)[0].substr(2)}</a>`);
            }
            socket.emit('message', val);
        }
        $('#chatBar').val('');
      });

      $(window).keydown((e) => {
        if(event.ctrlKey){
          if(e.keyCode === 13){
            if($('#chatBar').val().match(/^[\s\r\n\t]*$/)){
              alert('文字が入力されていません');
            }
            else{
                let val = $('#chatBar').val();
                val = val.replace(/</g, '&lt;');
                val = val.replace(/>/g, '&gt;');
                val = val.replace(/\n/g, '<br>');
                socket.emit('message', val);
            }
            $('#chatBar').val('');
            socket.emit('stop typing');
          }
        }
      });

      

      socket.on('message', (data) => {
        uname = data.userName;
        message = data.message;
        mid = data.id;
        iconid=1;
        if(myId===mid){
          iconid=0;
        }
        uname = uname.replace(/<script.*>/,'すくりぷと');
        message = message.replace(/<[^a^\/^b]/g, '&lt;');
        message = message.replace(/\n/g, '<br>');
        ma = message.match(/https?[\w\S]+/);
        if(ma){
          message = message.replace(ma[0],`<a target="_blank" href="$&">${ma[0].match(/\/\/[a-z0-9:\.]+\//)[0].substr(2)}</a>`);
        }
        cnt = `<div id="box">
              <div id="icon${iconid}"></div>
              <div id="name" align="left"><b>${uname}</b><p style="font-size: 10px;">(@${mid})</p></div>
              <div align="left"><p>${message}</p></div>
              </div>`;
        if(mid==myId){
          $('#messageArea1').prepend(cnt);
        }
        $('#messageArea2').prepend(cnt);
      });

      $("#chatBar").bind('input propertychange', () =>{
        if($(chatBar).val()===""){
          socket.emit('stop typing');
        }
        else{
          socket.emit('start typing');
        }
      });

      socket.on('update typing user', (data) => {
        tu='<div id="typeDialog"><b>Typing<br>';
        cnt = 0;
        for (var [id, username] of Object.entries(data.typingUser)) {
          if(id !== myId){
            tu+=`${username},`;
            cnt = (cnt+1)%2;
            if(cnt==0){
              tu+='<br>'
            }
          }
          if(!uList[id]){
            uList[id] = username;
          }
        }
        ne = '<div id="userList">';
        for(var [id,username] of Object.entries(uList)){
          console.log(id,username);
          if(id===myId){
            ne+=`<div id="box"><div id="icon0"></div><p><b>${username}</b></p><p>(@${id})</p></div>`;
          }
          else{
            ne+=`<div id="box"><div id="icon1"></div><p><b>${username}</b></p><p>(@${id})</p></div>`;
          }
        }
        ne+='</div>';
        tu+="</b></div>";
        $('#typeDialog').replaceWith(tu);
        $('#userList').replaceWith(ne);
      });

      socket.on('user left', (data) => {
        delete uList[data.leftUserId];
        console.log(uList);
        ne = '<div id="userList">';
        for(var [id,usename] of Object.entries(uList)){
          if(id===myId){
            ne+=`<div id="box"><div id="icon0"></div><p><b>${username}</b></p><p>(@${id})</p></div>`;
          }
          else{
            ne+=`<div id="box"><div id="icon1"></div><p><b>${username}</b></p><p>(@${id})</p></div>`;
          }
        }
        ne+='</div>';
        $('#userList').replaceWith(ne);
      });
      
    });
  });
  