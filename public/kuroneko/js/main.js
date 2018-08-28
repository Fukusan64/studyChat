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
    let userName = '';

    const validate = {
      soft: /(^[\ |\t]+$)/,
      hard: /(^[\ |\n|\t]+$)/
    };

    const msgFormat = (name, message) => {
      return {
        name,
        message
      };
    };

    const connectEvent = () => {

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
          },
          newLine() {
            console.log('Pressed Enter Key.');
          }
        }
      });

      socket.on('message', data => {
        contents.messages.push(msgFormat(data.userName, data.message));
      });

    };

    socket.on('connect', connectEvent);

  })();

}
