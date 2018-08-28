//
// index.js
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

    const connectEvent = () => {

      // TODO: 後で変える
      const loginDialog = $('#loginDialog').get(0);
      loginDialog.showModal();

      $('#closeButton').click(() => {
        if ($('#userName').val() !== '') {
          userName = $('#userName').val();
          socket.emit('join', $('#userName').val());
          loginDialog.close();
        }
      });

      document.getElementById('sendButton')
        .addEventListener('click', () => {

          const msg = document.getElementById('chatBar').value;

          if (!(/([\ |\r|\n])/).test(msg)) {

            const msgArea = document.getElementById('messageArea');
            msgArea.innerHTML += `<p>${userName}: ${msg}</p>`;

            socket.emit('message', msg);

            console.log(msg);

          }

        });

    };

    socket.on('connect', connectEvent);

    socket.on('message', data => {

      const msgArea = document.getElementById('messageArea');
      msgArea.innerHTML += `<p>${data.userName}: ${data.message}</p>`;

    });

  })();

}
