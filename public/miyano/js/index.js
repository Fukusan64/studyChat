document.addEventListener("DOMContentLoaded",()=>{
    const socket = io.connect();
    socket.on("connect",()=>{
        const loginDialog = document.getElementById("loginDialog");
        loginDialog.showModal();

        document.getElementById("closeButton").addEventListener("click",()=>{
            const userName = document.getElementById("userName").value;
            if(userName !== ""){
                socket.emit("join",userName);
                loginDialog.close();
            }
        })
    })
});