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

    const AutoLink = (str) => {
      const regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g;
      const regexp_makeLink = (all, url, h, href) => {
        return `<a target="_blank" href="h${href}">${url}</a>`;
      };

      return str.replace(regexp_url, regexp_makeLink);
    };

    const convertDay = (id) => {
      switch(id) {
      case 0:
        return '日';
      case 1:
        return '月';
      case 2:
        return '火';
      case 3:
        return '水';
      case 4:
        return '木';
      case 5:
        return '金';
      case 6:
        return '土';
      }
    };

    const zeroPadding = (string, length) => {
      let zero = '';
      for (let i = 0; i < length; i++) zero += '0';
      return (zero + string).slice(-length);
    };

    const msgFormat = (name, message, isMyPost) => {
      message = escape(message);
      return `<div class="name">${name}</div><div class="message ${isMyPost ? 'my-message' : ''}">${message}</div>`;
    };

    const infoFormat = (message) => {
      message = escape(message);
      const date = new Date();
      const Mth = date.getMonth();
      const dat = date.getDate();
      const day = convertDay(date.getDay());
      const H = date.getHours();
      const M = zeroPadding(date.getMinutes(), 2);
      const S = zeroPadding(date.getSeconds(), 2);

      let html = '';
      html += `<div class="contents-info-time">`;
      html += `${Mth}月${dat}日(${day}) `;
      html += `${H}:${M}:${S}`;
      html += `</div>`;
      html += `<div class="contents-info-msg">`;
      html += `${message}`;
      html += `</div>`;
      return html;
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
              chatInput.userName = userName;
              document.getElementById('chat-input-bar').focus();
            }
          }
        }
      });

      const contents = new Vue({
        el: '#contents',
        data: {
          messages: [],
        },
        methods: {
          isMyPost(id) {
            return (userID === id) ?
              'my-post' : '';
          },
          contentType(type) {
            return (type === 'msg') ?
              'contents-list' : 'contents-info';
          }
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

      const chatInput = new Vue({
        el: '#chat-input',
        data: {
          msg: '',
          userName: ''
        },
        computed: {
          myUserName() {
            if (!this.userName) return '';
            const possessive = (this.userName.split('').pop() === 's') ?
              '\'' : '\'s';
            return `${this.userName}${possessive} code here!`;
          }
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
        contents.messages.push({
          id: data.id,
          content: msgFormat(data.userName, data.message, (data.id === userID)),
          type: 'msg'
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
        contents.messages.push({
          id: '',
          content: infoFormat(`${data.userName} が入室しました`),
          type: 'info'
        });
      });

      socket.on('user left', async data => {
        Vue.delete(info.userList, data.leftUserId);
        Vue.delete(info.userList, 'undefined');
        await info.$nextTick();
        info.active = activate = data.numUsers;
        contents.messages.push({
          id: '',
          content: infoFormat(`${data.userName} が退室しました`),
          type: 'info'
        });
      });

      document.getElementById('login-input').focus();

    };

    socket.on('connect', connectEvent);

  })();

}
