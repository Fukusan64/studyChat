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
      soft: /(^[\ |\t]+$)/,
      hard: /(^[\ |\n|\t]+$)/
    };

    const msgFormat = (id, name, message) => {
      message = message.replace(/([&])/g, '&amp;');
      message = message.replace(/([<])/g, '&lt;');
      message = message.replace(/([>])/g, '&gt;');
      message = message.replace(/(["])/g, '&quot;');
      message = message.replace(/(['])/g, '&#39;');
      message = message.replace(/([\ ])/g, '&nbsp;');
      message = message.replace(/([\n])/g, '<br>');

      const className = (userID === id) ? 'my-posts' : 'others-posts';
      return `<div class="${className}"><div class="name">${name}</div><div class="message">${message}</div></div>`;
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
              userName = this.name;
              socket.emit('join', this.name);
              this.seen = false;
            }
          }
        }
      });

      const contents = new Vue({
        el: '#contents',
        data: {
          messages: []
        }
      });

      const myContents = new Vue({
        el: '#my-contents',
        data: {
          posts: []
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
            }
          }
        }
      });

      socket.on('message', data => {
        const msg = msgFormat(data.id, data.userName, data.message);
        contents.messages.push(msg);
        if (data.id === userID) {
          myContents.posts.push(msg);
        }
      });

      socket.on('login', data => {
        activate = data.numUsers;
      });

    };

    socket.on('connect', connectEvent);

  })();

}
