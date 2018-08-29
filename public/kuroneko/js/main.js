//
// main.js
//

{
  'use strict';

  const waitLoad = () => {
    return new Promise(s => {
      window.onload = s;
    });
  };

  (async() => {

    await waitLoad();

    const socket = io.connect();

    let userID = '';
    let userName = '';

    let activate = 0;

    const validate = {
      soft: /(^[ \t]+$)/,
      hard: /(^[ \n\t]+$)/
    };

    const escape = (string) => {
      string = string.replace(/([&])/g, '&amp;');
      string = string.replace(/([<])/g, '&lt;');
      string = string.replace(/([>])/g, '&gt;');
      string = string.replace(/(["])/g, '&quot;');
      string = string.replace(/(['])/g, '&#39;');
      string = string.replace(/([ ])/g, '&nbsp;');
      string = string.replace(/([\n])/g, '<br>');

      return AutoLink(string);
    };

    function AutoLink(str) {
      const regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g;
      const regexp_makeLink = (all, url, h, href) => {
        return `<a target="_blank" href="h${href}">${url}</a>`;
      };

      return str.replace(regexp_url, regexp_makeLink);
    }

    const msgFormat = (name, message, isMyPost) => {
      message = escape(message);
      return `<div class="name">${name}</div><div class="message ${isMyPost ? 'my-message' : ''}">${message}</div>`;
    };

    const connectEvent = () => {

      userID = socket.id;

      new Vue({
        el: '#login-modal',
        data: {
          seen: true,
          name: ''
        },
        methods: {
          clicked() {
            if (this.name && !validate.hard.test(this.name)) {
              userName = escape(this.name);
              socket.emit('join', escape(this.name));
              this.seen = false;
              document.getElementById('chat-input-bar').focus();
            }
          }
        }
      });

      const contents = new Vue({
        el: '#contents',
        data: {
          messages: [],
        }
      });

      const info = new Vue({
        el: '#info',
        data: {
          active: activate,
          data: [],
          userList: []
        },
        methods: {
          isMyID(id) {
            return id === userID;
          }
        }
      });

      new Vue({
        el: '#chat-input',
        data: {
          msg: ''
        },
        methods: {
          clicked() {
            if (this.msg && !validate.soft.test(this.msg)) {
              socket.emit('message', this.msg);
              this.msg = '';
              document.getElementById('chat-input-bar').focus();
            }
          }
        }
      });

      socket.on('message', async data => {
        const isMyPost = (data.id === userID);
        contents.messages.push({
          isMyPost,
          content: msgFormat(data.userName, data.message, isMyPost)
        });

        await contents.$nextTick();

        const content = document.getElementById('contents-box');
        const bottomItem = ([...content.children[0].children]).pop();

        content.scroll({
          top: content.scrollHeight + bottomItem.offsetHeight,
          left: 0,
          behavior: 'smooth'
        });
      });

      socket.on('login', data => {
        info.active = activate = data.numUsers;
        info.userList = data.userList;
      });

      socket.on('join', data => {
        info.active = activate = data.numUsers;
        info.userList[data.joinedUserId] = data.userName;
      });

      socket.on('user left', async data => {
        Vue.delete(info.userList, data.leftUserId);
        Vue.delete(info.userList, 'undefined');
        await info.$nextTick();
        info.active = activate = data.numUsers;
        // TODO: ここに退室した人の名前を書く
        console.log(data.userName);
      });

      document.getElementById('login-input').focus();

    };

    socket.on('connect', connectEvent);

  })();

}
