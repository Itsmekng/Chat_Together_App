window.addEventListener('load', onload);

let socket;
async function onload(){

    if(localStorage.getItem('token') == null){
        window.location.href = './AuthenticateUserPage/signUp.html';
    }

    socket = io('ws://localhost:3000',{
        auth:{
            token:JSON.parse(localStorage.getItem('token'))
        }
    });

    const chatId = JSON.parse(localStorage.getItem('chatId'));
    const groupId = JSON.parse(localStorage.getItem('groupChat'));

    if(chatId && groupId){
        socket.emit('chatIds',[...chatId, ...groupId]);
    }else if(chatId != null){
        socket.emit('chatIds',chatId);
    }else if(groupId != null){
        socket.emit('chatIds',groupId);
    }

    socket.emit('chatIds',[]);

    socket.on('chatIds',(message) => {
        console.log(message);
    });

    socket.emit('AllChat',JSON.parse(localStorage.getItem('chatId')));

    socket.emit('groupChat',JSON.parse(localStorage.getItem('groupChat')));

    socket.on('AllChat',(latestMessages) => {
        loadAllChat(latestMessages);
    });

    socket.on('groupChat',(latestMessages) => {
        loadAllGroupChat(latestMessages);
    });

    socket.on("notifyNewChat" ,(data) =>{
        const User = JSON.parse(localStorage.getItem('User'));

        if(data.chatType == "personal" && data.userId == User.id){
            let chatId = JSON.parse(localStorage.getItem('chatId')) || [];
            if (!chatId.includes(Number(data.chatId))) {
                chatId.push(Number(data.chatId));
            }
            localStorage.setItem('chatId', JSON.stringify(chatId));
            socket.emit('AllChat',JSON.parse(localStorage.getItem('chatId')));
        }else if (data.chatType == "group" && data.userId.includes(User.id)){
            let groupChat = JSON.parse(localStorage.getItem('groupChat')) || [];
            if (!groupChat.includes(Number(data.chatId))) {
                groupChat.push(Number(data.chatId));
            }
            localStorage.setItem('groupChat', JSON.stringify(groupChat));
            socket.emit('groupChat',JSON.parse(localStorage.getItem('groupChat')));
        }
    })

    socket.on("new-message",(data) => {
        const newMessage = document.querySelector(`.goTopersonalChat[data-attribute="${data.chatId}"]`);
        console.log(newMessage);
        if(newMessage){
            newMessage.querySelector(".newMessage").textContent = data.message;
            newMessage.querySelector(".newMessage").classList.remove('text-secondry');
            newMessage.querySelector(".newMessage").classList.add('text-success');
        }
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

    // socket.on('newGroup',({groupData}) => {
    //     console.log(groupData)
    // });
}

function logOut(){
    localStorage.clear();
    sessionStorage.clear();
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
            window.location.href = "/Chat/chat.html";
        }).catch((err) => {
            if(err.response.data.message == "User not exist !"){
                const userNotExistError = document.getElementById('userNotExistError');
                userNotExistError.classList.remove('d-none');
            }
        });
    }else {
        await axios.post("http://localhost:3000/api/v1/message/newGroup",{groupName:event.target.groupName.value,member:JSON.parse(sessionStorage.getItem('groupChat'))}, {headers: { authToken: JSON.parse(localStorage.getItem('token')) }}).then((response) => {
            // socket.emit('newGroup',{groupId:4});
            const groupId = response.data.data.id;
            let groupChat = JSON.parse(localStorage.getItem('groupChat')) || [];
            if (!groupChat.includes(groupId)) {
                groupChat.push(groupId);
            }
            localStorage.setItem('groupChat', JSON.stringify(groupChat));
            sessionStorage.setItem("chatId", JSON.stringify(groupId));
            window.location.href = "/Chat/chat.html";
        }).catch((err) =>{
            console.log(err);
        })
    }
    return true
}

function loadAllChat(latestMessages){
    const allChatMessage = document.getElementsByClassName('allChatMessage')[0];
    allChatMessage.innerHTML = "";
    const User = JSON.parse(localStorage.getItem('User'));
    for(let i = 0; i < latestMessages.chats.length; i++){
        if(latestMessages.chatMembers[i].ChatTypeId == latestMessages.chats[i].chatMessages[0].ChatTypeId){
            if(latestMessages.chats[i].chatMessages[0].UserId == User.id){
                latestMessages.pendingChatCount[i].pendingCount = 0;
            }
            let div = document.createElement('div');
            div.innerHTML = `<div class="d-flex align-items-center gap-3">
                                <div class="rounded-circle bg-primary text-white
                                            d-flex align-items-center justify-content-center
                                            flex-shrink-0"
                                    style="width: 42px; height: 42px;">
                                    ${latestMessages.chatMembers[i].User.full_name[0]}  
                                </div>
                                <div class="flex-grow-1 overflow-hidden">
                                    <div class="d-flex justify-content-between">
                                        <strong>${latestMessages.chatMembers[i].User.full_name}</strong>
                                        <small id="userID_${latestMessages.chatMembers[i].User.id}" class="text-muted">offline</small>
                                    </div>
                                    <small class="newMessage justify-content-between d-flex fw-bold d-block ${latestMessages.chats[i].chatMessages[0].status == "pending" && latestMessages.chats[i].chatMessages[0].UserId != User.id ? "text-success" : "text-secondary"}">
                                        ${ latestMessages.chats[i].chatMessages[0].message_type == "text" ? latestMessages.chats[i].chatMessages[0].message : "Img ⓘ"}
                                        <div>${latestMessages.pendingChatCount[i].pendingCount == 0 ? "<span> </span>" : "<spam class='text-light bg-success px-2 rounded-pill'>" + latestMessages.pendingChatCount[i].pendingCount + "</span>"}</div>
                                    </small>
                                </div>
                            </div>`
        
            div.classList.add('list-group-item','list-group-item-action','p-3','goTopersonalChat');
            div.dataset.attribute = latestMessages.chatMembers[i].ChatTypeId; 
        
            allChatMessage.appendChild(div);

            const goTopersonalChat = document.querySelectorAll('.goTopersonalChat');

            goTopersonalChat.forEach((element) => {
                element.addEventListener('click', function(event) {
                    const newChatId = event.currentTarget.dataset.attribute;
                    sessionStorage.setItem("chatId", newChatId);
                    let chatId = JSON.parse(localStorage.getItem('chatId')) || [];
                    if (!chatId.includes(Number(newChatId))) {
                        chatId.push(Number(newChatId));
                    }
                    localStorage.setItem('chatId', JSON.stringify(chatId));
                    window.location.href = "../Chat/chat.html";
                });
            });
        };
    };
}

function loadAllGroupChat(latestMessages){
    
    const allChatGroupMessage = document.getElementsByClassName('allChatGroupMessage')[0];
    allChatGroupMessage.innerHTML = "";
    const User = JSON.parse(localStorage.getItem('User'));
    for(let i = 0; i < latestMessages.chats.length; i++){
        if(latestMessages.chats[i].chatMessages[0].seenUser.split(',').map(Number).includes(User.id)){
            latestMessages.pendingChatCount[i].pendingCount = 0;
        }
        let div = document.createElement('div');
            div.innerHTML = `<div class="d-flex align-items-center gap-3">
                                <div class="rounded-circle bg-primary text-white
                                            d-flex align-items-center justify-content-center
                                            flex-shrink-0"
                                    style="width: 42px; height: 42px;">
                                    ${latestMessages.chats[i].chatName[0]}  
                                </div>
                                <div class="flex-grow-1 overflow-hidden">
                                    <div class="d-flex justify-content-between">
                                        <strong>${latestMessages.chats[i].chatName}</strong>
                                        <small id="userID_${latestMessages.chats[i].id}" class="text-muted"></small>
                                    </div>
                                    ${
                                        latestMessages.chats[i].chatMessages[0] == undefined 
                                        ? "<small class='newMessage fw-bold d-block text-secondary' >Say Hi </small>"
                                        :   "<small class='newMessage justify-content-between d-flex fw-bold d-block " +
                                            (
                                                latestMessages.chats[i].chatMessages[0].seenUser.split(',').map(Number).includes(User.id)
                                                    ? "text-secondary"
                                                    : "text-success"
                                            ) +
                                            "'>" +
                                            latestMessages.chats[i].chatMessages[0]?.User.full_name +
                                            " - " +
                                            (
                                                latestMessages.chats[i].chatMessages[0]?.message_type == "file"
                                                    ? "Img ⓘ"
                                                    : latestMessages.chats[i].chatMessages[0]?.message
                                            ) +
                                            (
                                                latestMessages.pendingChatCount[i].pendingCount == 0
                                                    ? ""
                                                    : "<span class='text-light bg-success px-2 rounded-pill'>" +
                                                    latestMessages.pendingChatCount[i].pendingCount +
                                                    "</span>"
                                            ) +
                                            "</small>"
                                    }
                                </div>
                            </div>`
        
            div.classList.add('list-group-item','list-group-item-action','p-3','goToGroupChat');
            div.dataset.attribute = latestMessages.chats[i].id; 
            allChatGroupMessage.appendChild(div);
    }

    const goToGroupChat = document.querySelectorAll('.goToGroupChat');

    goToGroupChat.forEach((element) => {
        element.addEventListener('click', function(event) {
            const newGroup = event.currentTarget.dataset.attribute;
            sessionStorage.setItem("chatId", newGroup);
            let groupChat = JSON.parse(localStorage.getItem('groupChat')) || [];
            if (!groupChat.includes(Number(newGroup))) {
                groupChat.push(Number(newGroup));
            }
            localStorage.setItem('groupChat', JSON.stringify(groupChat));
            window.location.href = "../Chat/chat.html";
        });
    });

}

const addUserbtn = document.getElementsByClassName('addUserbtn')[0];
addUserbtn.addEventListener('click' , function(){
    const addUser = document.getElementById('addUser');
    const receiverNumber = addUser.value;

    axios.post("http://localhost:3000/api/v1/message/checkUserByNumber" ,{receiverNumber}, {headers: { authToken: JSON.parse(localStorage.getItem('token')) }}).then((response) => {

        let groupChat = JSON.parse(sessionStorage.getItem('groupChat')) || [];

        if(!groupChat.includes(response.data.data.id)){
            groupChat.push(response.data.data.id);
            sessionStorage.setItem('groupChat',JSON.stringify(groupChat));
            const groupUser = document.getElementsByClassName('groupUser')[0];
            const li = document.createElement('li');
            li.classList.add('ps-2','pe-2','border','fs-6','rounded-pill');
            li.innerHTML = `${response.data.data.number} <span onclick="removeChatNumber(event)" data-UserId="${response.data.data.id}" class="text-danger fs-4">x</span>`
            groupUser.appendChild(li);
            addUser.value = "";
        }
    }).catch((err) => {
        console.log(err)
    })
})

function removeChatNumber(event) {
    const userId = event.target.dataset.userid;
    let groupChat = JSON.parse(sessionStorage.getItem('groupChat'));
    if (groupChat.includes(Number(userId))) {
        groupChat.splice(groupChat.indexOf(userId), 1);
    }
    sessionStorage.setItem('groupChat',JSON.stringify(groupChat));
    event.target.closest('li').remove();

    return true;
}

const chatType = document.getElementsByClassName('chatType')[0];
chatType.addEventListener('change' , function(){
    const addUserbtn = document.getElementsByClassName('addUserbtn')[0];
    const groupChat = document.getElementsByClassName('groupChat')[0];
    const chatGroup = document.getElementsByClassName('chatGroup')[0];
    const personalChat = document.getElementsByClassName('personalChat')[0];
    if(chatType.value == "group"){
        addUserbtn.classList.remove('d-none');
        groupChat.classList.remove('d-none');
        chatGroup.classList.remove('d-none');
        personalChat.classList.remove('d-block');
        personalChat.classList.add('d-none');
    }else{
        addUserbtn.classList.add('d-none');
        groupChat.classList.add('d-none');
        chatGroup.classList.add('d-none');
        personalChat.classList.remove('d-none');
        personalChat.classList.add('d-block');
    }
    return true
})

const myModal = document.getElementById('exampleModal');

myModal.addEventListener('hidden.bs.modal', function (event) {
    const groupUser = document.getElementsByClassName('groupUser')[0];
    const addUser = document.getElementById('addUser');
    addUser.value = "";
    groupUser.innerHTML = "";
    sessionStorage.removeItem('groupChat');
});