window.addEventListener('load',connectToServer);

async function connectToServer(){
    
    if(localStorage.getItem('token') == null){
        window.location.href = '../AuthenticateUserPage/signUp.html';
    };

    const chatId = JSON.parse(sessionStorage.getItem('chatId'));

    if(chatId == null){
        window.location.href = '/Client/index.html';
    };

    let userId;
    await axios.post("http://localhost:3000/api/v1/message/getDetails",{chatId},{headers: { authToken: JSON.parse(localStorage.getItem('token')) }}).then((response) => {
        document.getElementsByClassName('navbar-brand')[0].innerHTML = response.data.data.User.full_name;
        userId = response.data.data.User.id;
    }).catch((err) => {
        console.log(err);
    })
    
    const chatContainer = document.getElementsByClassName('chatPage')[0];
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const socket = io('ws://localhost:3000',{
        auth:{
            token:JSON.parse(localStorage.getItem('token'))
        }
    });

    socket.emit('chatIds',JSON.parse(localStorage.getItem('chatId')));

    socket.emit('getRecentMessage',chatId);

    socket.on('getRecentMessage',(data) => {
        RecentData(data.chatMessages);
    })

    socket.on('onlineUser',(onlineUser) => {
        let userStatus = document.getElementsByClassName('userStatus')[0];
        if(onlineUser.indexOf(userId) >= 0){
            userStatus.classList.add('nav-link','text-light');
            userStatus.innerHTML = "Online"
        }else{
            userStatus.classList.add('nav-link','text-light');
            userStatus.innerHTML = "Offline"
        }
        return true
    });

    socket.on('OfflineUser',(OfflineUser) => {
        if(userId == OfflineUser.userId){
            let userStatus = document.getElementsByClassName('userStatus')[0];
            userStatus.innerHTML = "Offline"
        }
    })
    const ActiveUser = JSON.parse(localStorage.getItem('User'));

    socket.emit("ActiveUser",{ActiveUser:ActiveUser.id,chatId,userId});

    socket.on("ActiveUser",(ActiveUser) => {
        if(ActiveUser.indexOf(userId) >= 0){
            const Readtext = document.querySelectorAll('div.bg-secondary');
            Readtext.forEach((element) => {
                element.classList.remove("bg-secondary");
                element.classList.add("bg-success");
            });
        }
        return true
    })

    socket.on('chatIds',(message) => {
        console.log(message);
    });

    socket.on("new-message",(data) => {
        displayMessage(data);
    });

    socket.on("inactiveUser",(activeUser) =>{
        console.log(activeUser);
    })

    window.addEventListener("beforeunload", () => {
        socket.emit("inactiveUser",{ActiveUser:ActiveUser.id});
    });

    function displayMessage(data){

        const chatPage = document.getElementsByClassName('chatPage')[0];
        const div = document.createElement('div');
        
        const user = JSON.parse(localStorage.getItem('User'));

        if(user.number == data.userNumber){
            div.innerHTML = `<div class="${ data.status == "read"? "bg-success" : "bg-secondary"} text-white rounded-3 p-3"
                                style="max-width: 80%;">
                                <div>${data.message}</div>
                                <div class="text-white-50 text-end mt-1">
                                    <small>${new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</small>
                                </div>
                            </div>`
            div.classList.add('d-flex','justify-content-end','mb-3');
        }else{
            div.innerHTML = `<div class="bg-white border rounded-3 p-3 shadow-sm"
                                style="max-width: 80%;">
                                <div>${data.message}</div>
                                <div class="text-muted text-end mt-1">
                                    <small>${new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</small>
                                </div>
                            </div>`
            div.classList.add('d-flex','mb-3');
        }
        chatPage.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return true
    }

    function RecentData(data){
        for(let i = 0; i < data.length; i++){
            const chatPage = document.getElementsByClassName('chatPage')[0];
            const div = document.createElement('div');

            if(data[i].UserId !== userId){
                div.innerHTML = `<div class="${ data[i].status == "read"? "bg-success" : "bg-secondary"} text-white rounded-3 p-3"
                                style="max-width: 80%;">
                                <div>${data[i].message}</div>
                                <div class="text-white-50 text-end mt-1">
                                    <small>${new Date(data[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</small>
                                </div>
                            </div>`
                div.classList.add('d-flex','justify-content-end','mb-3');
            }else{
                div.innerHTML = `<div class="bg-white border rounded-3 p-3 shadow-sm"
                                style="max-width: 80%;">
                                <div>${data[i].message}</div>
                                <div class="text-muted text-end mt-1">
                                    <small>${new Date(data[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</small>
                                </div>
                            </div>`
                div.classList.add('d-flex','mb-3');
            }
            chatPage.prepend(div);
        }

        return true;

    }

    function sendMessage(event){
        event.preventDefault();
        const message = event.target.sendMessage.value
        socket.emit('new-message',({message ,chatId,userId}));
        event.target.reset();
    }

    const myForm = document.getElementById("sendMessage");
    myForm.addEventListener("submit", sendMessage);

}

function logOut(){
    localStorage.removeItem('token');
    window.location.href = './AuthenticateUserPage/signUp.html';
}