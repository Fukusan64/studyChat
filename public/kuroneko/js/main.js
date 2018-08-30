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

    const typingFormat = (name) => {
      let html = '';
      html += '<div>';
      html += `<span class="typing-user-name">${name}</span>`;
      html += '<span class="typing-user-text"> is typing...</span>';
      html += '</div>';
      return html;
    };

    const autoScroll = () => {
      const content = document.getElementById('contents-box');
      const bottomItem = ([...content.children[0].children]).pop();
      content.scroll({
        top: content.scrollHeight + bottomItem.offsetHeight,
        left: 0,
        behavior: 'smooth'
      });
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
          userList: [],
          typing: {
            title: '',
            isEmpty: true,
            users: []
          }
        },
        methods: {
          isMyID(id) {
            return id === userID;
          },
          typingSwitch(val) {
            this.typing.isEmpty = val;
            this.typing.title = (this.typing.isEmpty) ?
              'Typing...' : '';
          }
        },
      });

      const chatInput = new Vue({
        el: '#chat-input',
        data: {
          msg: '',
          userName: '',
          isExtended: false,
          timeoutID: null
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
              if (this.timeoutID) {
                clearTimeout(this.timeoutID);
                this.timeoutID = null;
              }
              socket.emit('stop typing');
              socket.emit('message', this.msg);
              this.msg = '';
              document.getElementById('chat-input-bar').focus();
            }
          },
          async extend() {
            this.isExtended ^= true;

            const chatWindow = this.$el;
            const [chatArea, chatBtn, chatExtend] = [...chatWindow.children].map(el => el.style);
            const contentsArea = contents.$el;
            const contentsBox = contentsArea.children[1].style;
            const infoArea = info.$el.style;

            const waitTransition = () => {
              const elem = [chatWindow, ...chatWindow.children, contentsArea, contentsArea.children[1], info.$el];
              const waitEvents = [];
              for (const e of elem) {
                waitEvents.push(() => {
                  return new Promise(s => {
                    e.addEventListener('transitionend', s);
                  });
                });
              }
              return new Promise(async s => {
                const listener = new Proxy({process: elem.length, done: 0}, {
                  set(target) {
                    target.done++;
                    if (target.process === target.done) s();
                    return true;
                  }
                });
                for (const event of waitEvents) {
                  await event();
                  listener.done++;
                }
              });
            };

            if (this.isExtended) {
              chatWindow.style.height = 'calc(48vh + 6px)';
              chatArea.height = '48vh';
              chatBtn.height = '48vh';
              chatBtn.marginTop = '-48vh';
              chatExtend.marginTop = '-55vh';
              contentsArea.style.height = 'calc(52vh - 6px)';
              contentsBox.height = 'calc(45vh - 6px)';
              infoArea.marginTop = 'calc(0px - (52vh - 6px))';
            }
            else {
              chatWindow.style.height = 'calc(16vh + 6px)';
              chatArea.height = '16vh';
              chatBtn.height = '16vh';
              chatBtn.marginTop = '-16vh';
              chatExtend.marginTop = '-23vh';
              contentsArea.style.height = 'calc(84vh - 6px)';
              contentsBox.height = 'calc(77vh - 6px)';
              infoArea.marginTop = 'calc(0px - (84vh - 6px))';
            }

            await waitTransition();
            autoScroll();
          },
          typed() {
            if (this.timeoutID === null) {
              socket.emit('start typing');
            }
            else {
              clearTimeout(this.timeoutID);
            }
            this.timeoutID = setTimeout(() => {
              this.timeoutID = null;
              socket.emit('stop typing');
            }, 2000);
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
        autoScroll();
      });

      socket.on('login', data => {
        info.active = activate = data.numUsers;
        info.userList = data.userList;
      });

      socket.on('join', async data => {
        info.active = activate = data.numUsers;
        info.userList[data.joinedUserId] = data.userName;
        contents.messages.push({
          id: '',
          content: infoFormat(`${data.userName} が入室しました`),
          type: 'info'
        });
        await contents.$nextTick();
        autoScroll();
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
        await contents.$nextTick();
        autoScroll();
      });

      socket.on('update typing user', async data => {
        info.typing.users.length = 0;
        for (const [ID, name] of Object.entries(data.typingUser)) {
          if (userID !== ID) {
            info.typing.users.push(typingFormat(name));
          }
        }
        await info.$nextTick();
        if (info.typing.users.length) {
          info.typingSwitch(true);
        }
        else info.typingSwitch(false);
      });

      document.getElementById('login-input').focus();

    };

    socket.on('connect', connectEvent);

  })();

}
