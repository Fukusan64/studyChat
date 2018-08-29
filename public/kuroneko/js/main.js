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

    const escape = (string) => {
      string = string.replace(/([&])/g, '&amp;');
      string = string.replace(/([<])/g, '&lt;');
      string = string.replace(/([>])/g, '&gt;');
      string = string.replace(/(["])/g, '&quot;');
      string = string.replace(/(['])/g, '&#39;');
      string = string.replace(/([\ ])/g, '&nbsp;');
      string = string.replace(/([\n])/g, '<br>');

      return string;
    };

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
              document.getElementById('chat-input-bar').focus();
            }
          }
        }
      });

      socket.on('message', data => {
        const isMyPost = (data.id === userID);
        contents.messages.push({
          isMyPost,
          content: msgFormat(data.userName, data.message, isMyPost)
        });
        if (isMyPost) {
          // myContents.posts.push(msgFormat(data.userName, data.message));
        }
      });

      socket.on('login', data => {
        activate = data.numUsers;
      });

      document.getElementById('login-input').focus();

    };

    socket.on('connect', connectEvent);

  })();

}
