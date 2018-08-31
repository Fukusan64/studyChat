$(()=> {
  
  const socket = io.connect();
  socket.on('connect', () => {
    const myId = socket.id;
    const loginDialog = $('#loginDialog').get(0);
    loginDialog.showModal();

    var textarea = document.getElementById("chatBar");
    function textareaHeight(){
      textarea.style.height = "96%"
    }
    textareaHeight();

    function printTime(){
      nD = new Date();
      Year = nD.getYear()+1900;
      Month = nD.getMonth() + 1;
      Day = nD.getDate();
      Hours = nD.getHours();
      Minutes = ("00"+nD.getMinutes()).slice(-2);
      Seconds = nD.getSeconds();
      var time = Year+"/"+Month+"/"+Day+" "+Hours+":"+Minutes+" "+Seconds+"s";
      return time;
    }

    $('#closeButton').click(() => {
      if($('#userName').val() !== '') {
        socket.emit('join', $('#userName').val());
        loginDialog.close();
      }
      setTimeout(() => {
        $('#chatBar').focus()
      },1);
    });

    $('#userName').on("keydown", function(e) {
      if(e.keyCode === 13) {
        $('#closeButton').trigger("click");
      }
    });

    $('#sendButton').click(()=>{
      if($('#chatBar').val() != ''){
        socket.emit('message', escapeHTML($('#chatBar').val()));
        $('#chatBar').val("");
        textareaHeight();
      }
    });
    
    $('#chatBar').on("keydown", function(e) {
      if(e.keyCode === 13) {
        if(event.ctrlKey){
          $('#sendButton').trigger("click");
        }
      }
    });

    function escapeHTML(str) {
      str = str.replace(/&/g, '&amp;');
      str = str.replace(/</g, '&lt;');
      str = str.replace(/>/g, '&gt;');
      str = str.replace(/"/g, '&quot;');
      str = str.replace(/'/g, '&#39;');
      return str;
     }

    var html = document.getElementById('messageArea');
    /*
    $('#detachButton').click(() =>{
      console.log("html.scrollHeight:"+html.scrollHeight);
      $('#messageArea').scrollTop(html.scrollHeight);
      $('#newPostNotice').detach();
    });
    */

    $(function() {
      var $textarea = $('#chatBar');
      var lineHeight = parseInt($textarea.css('lineHeight'));
      $textarea.on('input', function(e) {
        var lines = ($(this).val() + '\n').match(/\n/g).length;
        $(this).height(lineHeight * lines);
      });
    });

    socket.on('message', data => {
      var before = html.scrollHeight;
      var message = data.message.replace(/\n/gi, "<br>");
      var nTime = printTime();
      $('#messageArea').append(`
        <div class="dataSet" style="color: ${(data.id == myId) ? '#607d8b':'#00c853'}">
           ${data.userName} <span class='postingTime'>${nTime}</span><br>
          <span class='message'>${message}</span>
        </div><hr/>
      `)
      var after = html.scrollHeight;
      var now = $('#messageArea').scrollTop();
      if(now + html.clientHeight === before){
        $('#messageArea').scrollTop(after)
      }
      /*
      else{
        $('body').append(`
          <div id="newPostNotice">
            <button id="detachButton" class="button">New message</button>
          </div>
        `)
      }
      */
      
    });
  });
});
