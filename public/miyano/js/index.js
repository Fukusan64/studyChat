document.addEventListener("DOMContentLoaded",()=>{
    const socket = io.connect();

    // 鯖につなぐ
    socket.on("connect",()=>{
        const loginDialog = document.getElementById("loginDialog");
        loginDialog.showModal();

        document.getElementById("closeButton").addEventListener("click",()=>{
            const userName = creanInput(document.getElementById("userName").value);
            if(userName !== ""){
                socket.emit("join",userName);
                loginDialog.close();
                document.getElementById("chatBar").placeholder = "Chat as " + userName;
                document.getElementById("welcome").innerHTML = userName + " さん、SimpleChat へようこそ！<br>自由気ままなチャットをお楽しみください。"
            }
        });
        document.getElementById("userName").addEventListener("keydown",(e)=>{
            if(e.keyCode === 13) document.getElementById("closeButton").click();
        });
    });

    // チャットをちゃっと送るやつ
    document.getElementById("sendButton").addEventListener("click",()=>{
        let message = creanInput(document.getElementById("chatBar").value);
        if(message){
            socket.emit("message",message);
            console.info(now()+"Message was sent!");
            document.getElementById("chatBar").value = "";
        }else{
            console.error(now()+"Message was not sent.");
        }
    });
    document.getElementById("chatBar").addEventListener("keydown",(e)=>{
        if(e.keyCode === 13) document.getElementById("sendButton").click();
    });


    // メッセージが飛んできたときのやつ
    socket.on("message",(data)=>{
        //ログを残す
        console.info(now()+"Receive message!");
        console.dir(data);
        //全体要素生成
        let message = document.createElement("div");
        message.classList.add("message");
        //ユーザー情報
        let userName = document.createElement("h2");
        userName.innerHTML = data.userName + "<span class='userId'>ID:"+data.id+"</span>";
        //メッセージコンテント
        let messageContent = document.createElement("p");
        let messageText = creanInput(data.message);
        messageText = convertLink(messageText);
        messageContent.innerHTML = messageText;
        //自分の発言
        if(data.id === socket.id){
            message.classList.add("myMessage");
        }
        //完成
        message.appendChild(userName);
        message.appendChild(messageContent);
        //画面上に追加
        addItem(message);
    });

    // 人が生えたときのやつ
    socket.on("join",(data)=>{
        //ログを残す
        console.info(now()+"New user joined to chat!");
        console.dir(data);
        //全体要素作成
        let info = document.createElement("div");
        info.classList.add("message");
        info.classList.add("system");
        //情報を埋める
        info.innerHTML = "<strong>"+data.userName+"</strong>さんがログインしました";
        //画面上に追加
        addItem(info);
    });

    // 人が消えた時のやつ
    socket.on("user left",(data)=>{
        //ログを残す
        console.info(now()+"1 user left from chat...");
        console.dir(data);
        //全体要素作成
        let info = document.createElement("div");
        info.classList.add("message");
        info.classList.add("system");
        //情報を埋める
        info.innerHTML = "<strong>"+data.userName+"</strong>さんが消えました";
        //画面上に追加
        addItem(info);
    });

    //鯖が死んだときのやつ
    socket.on("disconnect",()=>{
        //ログを残す
        console.error(now()+"Disconnect detect!");
        //要素作成
        let info = document.createElement("div");
        info.classList.add("message");
        info.classList.add("system");
        info.innerHTML = "<span style='color: darkred'>サーバとの接続が切れました<br>再接続可能になった場合再びログインできるようになります</span>";
        addItem(info);
    });

    // アイテム追加関数
    const addItem = (element)=>{
        let messageArea = document.getElementById("messageArea");
        let time = document.createElement("p");
        let date = new Date();
        time.classList.add("postTime");
        time.innerText = date.toTimeString();
        element.appendChild(time);
        messageArea.insertBefore(element,messageArea.firstChild);
    };

    // ログ用時刻表示関数
    const now = ()=>{
        let date = new Date();
        return "["+date.toISOString()+"]";
    };

    // 入力をきれいにする
    const creanInput = (string)=>{
        //HTMLタグの除去
        string = string.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');
        return string;
    };

    // URLを検出してリンクにするやつ
    const convertLink = (str)=>{
        let regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/;
        let regexp_makeLink = (all, url, h, href) => {
            return '<a href="h' + href + '" target="_blank">' + url + '</a>';
        };

        return str.replace(regexp_url, regexp_makeLink);
    };
});