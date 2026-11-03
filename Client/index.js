window.addEventListener('load', onload);

async function onload(){

    if(localStorage.getItem('token') == null){
        window.location.href = './AuthenticateUserPage/signUp.html';
    }

    const socket = io('ws://localhost:3000',{
        auth:{
            token:JSON.parse(localStorage.getItem('token'))
        }
    });

    socket.emit('chatIds',JSON.parse(localStorage.getItem('chatId')));

    socket.on('chatIds',(message) => {
        console.log(message);
    });

    socket.emit('AllChat',JSON.parse(localStorage.getItem('chatId')));

    socket.on('AllChat',(latestMessages) => {
        loadAllChat(latestMessages);
    });

    socket.on("new-message",(data) => {
        const newMessage = document.querySelector(`.goTopersonalChat[data-attribute="${data.chatId}"]`);
        newMessage.querySelector(".newMessage").textContent = data.message;
        newMessage.querySelector(".newMessage").classList.remove('text-secondry');
        newMessage.querySelector(".newMessage").classList.add('text-success');
    });

    socket.on('onlineUser',(onlineUser) => {
        const myId = JSON.parse(localStorage.getItem('User'));
        for(let i = 0; i < onlineUser.length; i++){
            if(onlineUser[i] == myId.id){
                continue
            };

            const User = document.getElementById(`userID_${onlineUser[i]}`);
            if(User){
                User.innerHTML = "online";
            }
        }
    });

    socket.on('OfflineUser',(OfflineUser) => {
        console.log();
        const User = document.getElementById(`userID_${OfflineUser.userId}`);
        if(User){
            User.innerHTML = "offline";
        }
    })
}

function logOut(){
    localStorage.removeItem('token');
    window.location.href = './AuthenticateUserPage/signUp.html';
}

async function searchUser(event){

    event.preventDefault();

    if(event.target.chatOption.value == "personalChat"){
        
        await axios.post("http://localhost:3000/api/v1/message/newChat",{receiverNumber: event.target.userNumber.value}, {headers: { authToken: JSON.parse(localStorage.getItem('token')) }}).then((response) => {

            const newChatId = response.data.data;
            sessionStorage.setItem("chatId", JSON.stringify(newChatId));
            let chatId = JSON.parse(localStorage.getItem('chatId')) || [];
            if (!chatId.includes(newChatId)) {
                chatId.push(newChatId);
            }
            localStorage.setItem('chatId', JSON.stringify(chatId));
            event.target.reset();
            window.location.href = "../Client/Chat/chat.html";
        }).catch((err) => {
            if(err.response.data.message == "User not exist !"){
                const userNotExistError = document.getElementById('userNotExistError');
                userNotExistError.classList.remove('d-none');
            }
        });
    }
    return true
}

function loadAllChat(latestMessages){
    const allChatMessage = document.getElementsByClassName('allChatMessage')[0];
    for(let i = 0; i < latestMessages.chats.length; i++){
        console.log(latestMessages.chats[0].chatMessages[0].status)
        if(latestMessages.chatMembers[0].ChatTypeId == latestMessages.chats[0].chatMessages[0].ChatTypeId){
            let div = document.createElement('div');
            div.innerHTML = `<div class="d-flex align-items-center gap-3">
                                <div class="rounded-circle bg-primary text-white
                                            d-flex align-items-center justify-content-center
                                            flex-shrink-0"
                                    style="width: 42px; height: 42px;">
                                    R
                                </div>
                                <div class="flex-grow-1 overflow-hidden">
                                    <div class="d-flex justify-content-between">
                                        <strong>${latestMessages.chatMembers[0].User.full_name}</strong>
                                        <small id="userID_${latestMessages.chatMembers[0].User.id}" class="text-muted">offline</small>
                                    </div>
                                    <small class="newMessage fw-bold d-block ${latestMessages.chats[0].chatMessages[0].status == "pending"? "text-success" : "text-secondary"}">
                                        ${latestMessages.chats[0].chatMessages[0].message}
                                    </small>
                                </div>
                            </div>`
        
            div.classList.add('list-group-item','list-group-item-action','p-3','goTopersonalChat');
            div.dataset.attribute = latestMessages.chatMembers[0].ChatTypeId; 
        
            allChatMessage.appendChild(div);

            const goTopersonalChat = document.querySelector('.goTopersonalChat'); 

            goTopersonalChat.addEventListener('click', function(event) { 
                const newChatId = event.currentTarget.dataset.attribute;
                sessionStorage.setItem("chatId", JSON.stringify(newChatId));
                let chatId = JSON.parse(localStorage.getItem('chatId')) || [];
                if (!chatId.includes(newChatId)) {
                    chatId.push(newChatId);
                }
                localStorage.setItem('chatId', JSON.stringify(chatId));
                window.location.href = "../Client/Chat/chat.html";
            });
        };
    };
    

}


{/* <a href="./Chat/chat.html"class="list-group-item list-group-item-action p-3">
    <div class="d-flex align-items-center gap-3">
        <div class="rounded-circle bg-primary text-white
                    d-flex align-items-center justify-content-center
                    flex-shrink-0"
            style="width: 42px; height: 42px;">
            R
        </div>
        <div class="flex-grow-1 overflow-hidden">
            <div class="d-flex justify-content-between">
                <strong>Rahul Sharma</strong>
                <small class="text-muted">10:32</small>
            </div>
            <small class="text-muted text-truncate d-block">
                Are we meeting today?
            </small>
        </div>
    </div>
</a> */}