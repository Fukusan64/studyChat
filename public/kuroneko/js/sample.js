//
// main.js
//

{
  'use strict';
  $(() => {

    const socket = io.connect();
    
    socket.on('connect', () => {

      const loginDialog = $('#loginDialog').get(0);
      loginDialog.showModal();

      $('#closeButton').click(() => {
        if ($('#userName').val() !== '') {
          socket.emit('join', $('#userName').val());
          loginDialog.close();
        }
      });

      

    });

  });
}