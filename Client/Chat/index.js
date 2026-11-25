window.addEventListener('load',connectToServer);

let userId;
let chatId;
let socket;
let ActiveUser;
let typingTimeout = null;
let textMessage;
let chatType;
async function connectToServer(){
    
    if(localStorage.getItem('token') == null){
        window.location.href = '../AuthenticateUserPage/signUp.html';
    };

    chatId = JSON.parse(sessionStorage.getItem('chatId'));
    chatType = localStorage.getItem('chatType');

    if(chatId == null){
        window.location.href = '/Client/index.html';
    };

    await axios.post("http://localhost:3000/api/v1/message/getDetails",{chatId},{headers: { authToken: JSON.parse(localStorage.getItem('token')) }}).then((response) => {
        if(response.data.data.chatType.chatType == "group"){
            localStorage.setItem('chatType',"group");
            document.getElementsByClassName('navbar-brand')[0].innerHTML = response.data.data.chatType.chatName;
            document.getElementsByClassName('showMembers')[0].classList.remove('d-none');
            const groupMembers = document.getElementsByClassName('groupMembers')[0];
            let userArray = [];
            let userData = {};
            for(let i = 0; i < response.data.data.receiverDetails.length; i++){
                let li = document.createElement('li');
                li.classList.add('text-light' , 'text-nowrap','px-2');
                li.innerHTML = `
                    ${response.data.data.receiverDetails[i].User.full_name} - <span data-userId=${response.data.data.receiverDetails[i].User.id} >Offline</span></li>
                `
                groupMembers.appendChild(li);
                userArray.push(response.data.data.receiverDetails[i].User.id);
                userData[response.data.data.receiverDetails[i].User.id] = response.data.data.receiverDetails[i].User.full_name
            }
            userId = userArray;
            sessionStorage.setItem('userData',JSON.stringify(userData));
        }else{
            localStorage.setItem('chatType',"personal");
            document.getElementsByClassName('navbar-brand')[0].innerHTML = response.data.data.receiverDetails.User.full_name;
            userId = response.data.data.receiverDetails.User.id;
        }

    }).catch((err) => {
        console.log(err);
    });
    
    const chatContainer = document.getElementsByClassName('chatPage')[0];

    socket = io('ws://localhost:3000',{
        auth:{
            token:JSON.parse(localStorage.getItem('token'))
        }
    });

    socket.on("notifyNewChat" ,(data) =>{
        const User = JSON.parse(localStorage.getItem('User'));

        if(data.chatType == "personal" && data.userId == User.id){
            let chatId = JSON.parse(localStorage.getItem('chatId')) || [];
            if (!chatId.includes(Number(data.chatId))) {
                chatId.push(Number(data.chatId));
            }
            localStorage.setItem('chatId', JSON.stringify(chatId));
        }else if (data.chatType == "group" && data.userId.includes(User.id)){
            let groupChat = JSON.parse(localStorage.getItem('groupChat')) || [];
            if (!groupChat.includes(Number(data.chatId))) {
                groupChat.push(Number(data.chatId));
            }
            localStorage.setItem('groupChat', JSON.stringify(groupChat));
        }
    })

    chatId = JSON.parse(localStorage.getItem('chatId'));
    const groupId = JSON.parse(localStorage.getItem('groupChat'));

    if(chatId && groupId){
        socket.emit('chatIds',[...chatId, ...groupId]);
    }else if(chatId != null){
        socket.emit('chatIds',chatId);
    }else if(groupId != null){
        socket.emit('chatIds',groupId);
    }

    let cursor = null;
    let hasMore = true;
    let isLoading = false;
    let isInitialLoading = true;

    function getMessages() {
        if (isLoading || !hasMore) return;
        isLoading = true;
        socket.emit('getRecentMessage', {
            chatId: JSON.parse(sessionStorage.getItem('chatId')),
            cursor: cursor
        });
    }

   socket.on('getRecentMessage', (data) => {
        isLoading = false;
        cursor = data.nextCursor;
        hasMore = data.hasMore;

        // Save current scroll position before adding messages
        const oldScrollHeight = chatContainer.scrollHeight;
        const oldScrollTop = chatContainer.scrollTop;

        RecentData(data.chatMessages);

        if (isInitialLoading) {
            // First 5 messages: go to the bottom
            chatContainer.scrollTop = chatContainer.scrollHeight;
            isInitialLoading = false;
        } else {
            // Older 5 messages: maintain the current visible position
            const newScrollHeight = chatContainer.scrollHeight;

            chatContainer.scrollTop =
                oldScrollTop + (newScrollHeight - oldScrollHeight);
        }
    });

    // Load first 5 messages
    getMessages();

    chatContainer.addEventListener('scroll', function () {
        if (isInitialLoading || isLoading || !hasMore) return;
        if (chatContainer.scrollTop <= 1) {
            getMessages();
        }
    });

    socket.on('onlineUser',(onlineUser) => {
        if(localStorage.getItem('chatType') == "group"){
            for(let i = 0; i < onlineUser.length; i++){
                document.querySelector(`span[data-userid="${onlineUser[i]}"]`).textContent = "Online";
            }
        }else{
            let userStatus = document.getElementsByClassName('userStatus')[0];
            if(onlineUser.indexOf(userId) >= 0){
                userStatus.classList.add('nav-link','text-light');
                userStatus.innerHTML = "Online"
            }else{
                userStatus.classList.add('nav-link','text-light');
                userStatus.innerHTML = "Offline"
            }
            return true
        }
    });

    socket.on('OfflineUser',(OfflineUser) => {
        if(localStorage.getItem('chatType') == 'group'){
            if(userId.includes(OfflineUser.userId)){
                document.querySelector(`span[data-userid="${OfflineUser.userId}"]`).textContent = "Offline";
            }
        }else{
            if(userId == OfflineUser.userId){
                let userStatus = document.getElementsByClassName('userStatus')[0];
                userStatus.innerHTML = "Offline"
            }
        }
    })
    ActiveUser = JSON.parse(localStorage.getItem('User'));

    socket.emit("ActiveUser",{ActiveUser:ActiveUser.id,chatId:JSON.parse(sessionStorage.getItem('chatId')),userId});

    socket.on("ActiveUser",(ActiveUser) => {
        let chatType = localStorage.getItem('chatType');
        if(chatType == "group"){
            let userData = JSON.parse(sessionStorage.getItem('userData'));
            const messages = document.querySelectorAll('.userMessage');

            messages.forEach((lastMessage) => {
                let title = "";
                let seenid = lastMessage.dataset.seenid
                    ? lastMessage.dataset.seenid.split(',').map(Number)
                    : [];

                let newSeenUser = ActiveUser.filter(num => !seenid.includes(num));
                seenid = [...seenid, ...newSeenUser];

                for (let i = 0; i < seenid.length; i++) {
                    title += `${userData[seenid[i]]}\n`;
                }

                if (seenid.length == userId.length) {
                    lastMessage.classList.remove('bg-secondary');
                    lastMessage.classList.add('bg-success');
                }

                lastMessage.dataset.seenid = seenid.join(',');
                lastMessage.title = title;
            });
        }else{
            if(ActiveUser.indexOf(userId) >= 0){
                const Readtext = document.querySelectorAll('div.bg-secondary');
                Readtext.forEach((element) => {
                    element.classList.remove("bg-secondary");
                    element.classList.add("bg-success");
                });
            }
        }
        return true
    });

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
        let title = "";
        if(!(data.chatType == "personal")){
            let userData = JSON.parse(sessionStorage.getItem('userData'));
            let userSeen = data.seenUser.split(',').sort((a,b) => a - b);
            for(let j = 0; j < userSeen.length; j++){
                title += `${userData[userSeen[j]]}&#10;`
            }
        }
        if(user.number == data.userNumber){
            div.innerHTML = `<div title="${title}" data-seenId="${data?.seenUser == undefined ? "" : data.seenUser }" class="${ data.status == "read"? "bg-success" : "bg-secondary"} text-white rounded-3 p-3 userMessage"
                                style="max-width: 80%;">
                                ${data.message_type == "text"
                                    ? `<div >${data.message}</div>`

                                    : ["mp4", "webm", "mov", "avi", "mkv", "m4v", "3gp"].includes(
                                        data.message.split("?")[0].split(".").pop().toLowerCase()
                                    )
                                        ? `<video
                                            controls
                                            class="img-fluid rounded w-100"
                                            style="max-width: 300px; height: auto; object-fit: contain;">
                                            <source src="${data.message}">
                                            Your browser does not support video playback.
                                        </video>`

                                    : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
                                        data.message.split("?")[0].split(".").pop().toLowerCase()
                                    )
                                        ? `<a  href="${data.message}" target="_blank">
                                                <img src="${data.message}" class="img-fluid" alt="">
                                        </a>`

                                    : `<div >
                                            <a href="${data.message}" target="_blank"
                                            class="text-reset text-decoration-none shadow-none" download>
                                                <img class="imageToUpload"
                                                    src="/public/icon/download.png"
                                                    width="35px" alt="">
                                            </a>
                                    </div>`
                                }
                                <div class="text-white-50 text-end mt-1">
                                    <small>${Array.isArray(userId) ? data.senderName : new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</small>
                                </div>
                            </div>`
            div.classList.add('d-flex','justify-content-end','mb-3');
        }else{
            div.innerHTML = `<div title="${title}" data-seenId="${data.seenUser}" class="bg-white border rounded-3 p-3 shadow-sm userMessage"
                                style="max-width: 80%;">
                                ${data.message_type == "text"
                                    ? `<div >${data.message}</div>`

                                    : ["mp4", "webm", "mov", "avi", "mkv", "m4v", "3gp"].includes(
                                        data.message.split("?")[0].split(".").pop().toLowerCase()
                                    )
                                        ? `<video
                                            controls
                                            class="img-fluid rounded w-100"
                                            style="max-width: 300px; height: auto; object-fit: contain;">
                                            <source src="${data.message}">
                                            Your browser does not support video playback.
                                        </video>`

                                    : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
                                        data.message.split("?")[0].split(".").pop().toLowerCase()
                                    )
                                        ? `<a href="${data.message}" target="_blank">
                                                <img src="${data.message}" class="img-fluid" alt="">
                                        </a>`

                                    : `<div>
                                            <a href="${data.message}" target="_blank"
                                            class="text-reset text-decoration-none shadow-none" download>
                                                <img class="imageToUpload"
                                                    src="/public/icon/download.png"
                                                    width="35px" alt="">
                                            </a>
                                    </div>`
                                }
                                <div class="text-muted text-end mt-1">
                                    <small>${Array.isArray(userId) ? data.senderName : new Date(data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) }</small>
                                </div>
                            </div>`
            div.classList.add('d-flex','mb-3');
        }
        chatPage.appendChild(div);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return true
    }

    function RecentData(data){
        if(Array.isArray(userId) == true){
            for(let i = 0; i < data.length; i++){
                let userData = JSON.parse(sessionStorage.getItem('userData'));
                let title = "";
                let userSeen = data[i].seenUser.split(',');
                for(let j = 0; j < userSeen.length; j++){
                    title += `${userData[userSeen[j]]}&#10;`
                }
                const chatPage = document.getElementsByClassName('chatPage')[0];
                const div = document.createElement('div');
                if(data[i].UserId == ActiveUser.id){
                    div.innerHTML = `<div title="${title}" data-seenId="${data[i].seenUser}" class="${ data[i].status == "read"? "bg-success" : "bg-secondary"} text-white rounded-3 p-3 userMessage"
                                                    style="max-width: 80%;">
                                                    ${data[i].message_type == "text"
                                                        ? `<div>${data[i].message}</div>`
    
                                                        : ["mp4", "webm", "mov", "avi", "mkv", "m4v", "3gp"].includes(
                                                            data[i].message.split("?")[0].split(".").pop().toLowerCase()
                                                        )
                                                            ? `<video
                                                                controls
                                                                class="img-fluid rounded w-100"
                                                                style="max-width: 300px; height: auto; object-fit: contain;">
                                                                <source src="${data[i].message}">
                                                                Your browser does not support video playback.
                                                            </video>`
    
                                                        : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
                                                            data[i].message.split("?")[0].split(".").pop().toLowerCase()
                                                        )
                                                            ? `<a href="${data[i].message}" target="_blank">
                                                                    <img src="${data[i].message}" class="img-fluid" alt="">
                                                            </a>`
    
                                                        : `<div>
                                                                <a href="${data[i].message}" target="_blank"
                                                                class="text-reset text-decoration-none shadow-none" download>
                                                                    <img class="imageToUpload"
                                                                        src="/public/icon/download.png"
                                                                        width="35px" alt="">
                                                                </a>
                                                        </div>`
                                                    }
                                    <div class="text-white-50 text-end mt-1">
                                        <small>${data[i].User.full_name}</small>
                                    </div>
                                </div>`
                    div.classList.add('d-flex','justify-content-end','mb-3');
                }else{
                    div.innerHTML = `<div title="${title}" data-seenId="${data[i].seenUser}" class="bg-white border rounded-3 p-3 shadow-sm userMessage"
                                                    style="max-width: 80%;">
                                                    ${data[i].message_type == "text"
                                                        ? `<div>${data[i].message}</div>`
    
                                                        : ["mp4", "webm", "mov", "avi", "mkv", "m4v", "3gp"].includes(
                                                            data[i].message.split("?")[0].split(".").pop().toLowerCase()
                                                        )
                                                            ? `<video
                                                                controls
                                                                class="img-fluid rounded w-100"
                                                                style="max-width: 300px; height: auto; object-fit: contain;">
                                                                <source src="${data[i].message}">
                                                                Your browser does not support video playback.
                                                            </video>`
    
                                                        : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
                                                            data[i].message.split("?")[0].split(".").pop().toLowerCase()
                                                        )
                                                            ? `<a href="${data[i].message}" target="_blank">
                                                                    <img src="${data[i].message}" class="img-fluid" alt="">
                                                            </a>`
    
                                                        : `<div>
                                                                <a href="${data[i].message}" target="_blank"
                                                                class="text-reset text-decoration-none shadow-none" download>
                                                                    <img class="imageToUpload"
                                                                        src="/public/icon/download.png"
                                                                        width="35px" alt="">
                                                                </a>
                                                        </div>`
                                                    }
                                    <div class="text-muted text-end mt-1">
                                        <small>${data[i].User.full_name}</small>
                                    </div>
                                </div>`
                    div.classList.add('d-flex','mb-3');
                }
                chatPage.prepend(div);
            }
        }else{
            for(let i = 0; i < data.length; i++){
                const chatPage = document.getElementsByClassName('chatPage')[0];
                const div = document.createElement('div');
                if(data[i].UserId !== userId){
                    div.innerHTML = `<div class="${ data[i].status == "read"? "bg-success" : "bg-secondary"} text-white rounded-3 p-3 userMessage"
                                                    style="max-width: 80%;">
                                                    ${data[i].message_type == "text"
                                                        ? `<div>${data[i].message}</div>`
    
                                                        : ["mp4", "webm", "mov", "avi", "mkv", "m4v", "3gp"].includes(
                                                            data[i].message.split("?")[0].split(".").pop().toLowerCase()
                                                        )
                                                            ? `<video
                                                                controls
                                                                class="img-fluid rounded w-100"
                                                                style="max-width: 300px; height: auto; object-fit: contain;">
                                                                <source src="${data[i].message}">
                                                                Your browser does not support video playback.
                                                            </video>`
    
                                                        : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
                                                            data[i].message.split("?")[0].split(".").pop().toLowerCase()
                                                        )
                                                            ? `<a href="${data[i].message}" target="_blank">
                                                                    <img src="${data[i].message}" class="img-fluid" alt="">
                                                            </a>`
    
                                                        : `<div>
                                                                <a href="${data[i].message}" target="_blank"
                                                                class="text-reset text-decoration-none shadow-none" download>
                                                                    <img class="imageToUpload"
                                                                        src="/public/icon/download.png"
                                                                        width="35px" alt="">
                                                                </a>
                                                        </div>`
                                                    }
                                    <div class="text-white-50 text-end mt-1">
                                        <small>${new Date(data[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</small>
                                    </div>
                                </div>`
                    div.classList.add('d-flex','justify-content-end','mb-3');
                }else{
                    div.innerHTML = `<div class="bg-white border rounded-3 p-3 shadow-sm userMessage"
                                                    style="max-width: 80%;">
                                                    ${data[i].message_type == "text"
                                                        ? `<div>${data[i].message}</div>`
    
                                                        : ["mp4", "webm", "mov", "avi", "mkv", "m4v", "3gp"].includes(
                                                            data[i].message.split("?")[0].split(".").pop().toLowerCase()
                                                        )
                                                            ? `<video
                                                                controls
                                                                class="img-fluid rounded w-100"
                                                                style="max-width: 300px; height: auto; object-fit: contain;">
                                                                <source src="${data[i].message}">
                                                                Your browser does not support video playback.
                                                            </video>`
    
                                                        : ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
                                                            data[i].message.split("?")[0].split(".").pop().toLowerCase()
                                                        )
                                                            ? `<a href="${data[i].message}" target="_blank">
                                                                    <img src="${data[i].message}" class="img-fluid" alt="">
                                                            </a>`
    
                                                        : `<div>
                                                                <a href="${data[i].message}" target="_blank"
                                                                class="text-reset text-decoration-none shadow-none" download>
                                                                    <img class="imageToUpload"
                                                                        src="/public/icon/download.png"
                                                                        width="35px" alt="">
                                                                </a>
                                                        </div>`
                                                    }
                                    <div class="text-muted text-end mt-1">
                                        <small>${new Date(data[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</small>
                                    </div>
                                </div>`
                    div.classList.add('d-flex','mb-3');
                }
                chatPage.prepend(div);
            }
        }
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return true;

    }

    async function sendMessage(event){
        event.preventDefault();
        const chatId = sessionStorage.getItem('chatId');
        if (event.target?.chatImage?.files?.length > 0) {
            const file = event.target.chatImage.files[0];
            const formData = new FormData();
            formData.append("chatImage", file);
            await axios.post("http://localhost:3000/api/v1/upload/upload-image",formData,{headers: {authToken: JSON.parse(localStorage.getItem('token'))}}).then((response) => {
                const message = response.data.data.secure_url;
                socket.emit('new-message', ({message,chatId,chatType:localStorage.getItem('chatType'),userId,message_type:"file"}));
            }).catch((err) => {
                console.log(err);
            });
        }

        if(!(event.target.sendMessage.value == "")){
            const message = event.target.sendMessage.value
            socket.emit('new-message',({message,chatId,chatType:localStorage.getItem('chatType'),userId,message_type:"text"}));
            event.target.reset();
        }

    }

    const myForm = document.getElementById("sendMessage");
    myForm.addEventListener("submit", sendMessage);

    socket.on("typing:update", ({ ActiveUser, isTyping }) => {
        if(isTyping){
            textMessage.placeholder = "typing";
        }else{
            textMessage.placeholder = "Type a message...";
        }
    });

}

const imageToUpload = document.getElementsByClassName('imageToUpload')[0];
imageToUpload.addEventListener('click', function(){
    const input = document.getElementById('uploadImage');
    input.click();
    return true
})

function logOut(){
    localStorage.removeItem('token');
    window.location.href = './AuthenticateUserPage/signUp.html';
}

function expandedChat (){
    const expandedChat = document.getElementsByClassName('expandedChat')[0];

    if (expandedChat.classList.contains('d-none')) {
        expandedChat.classList.remove('d-none');
        expandedChat.classList.add('d-flex');
    } else {
        expandedChat.classList.remove('d-flex');
        expandedChat.classList.add('d-none');
    }
}

const AskAI = document.getElementsByClassName('AskAI')[0];
AskAI.addEventListener('click' , AskAI_Fun);

const expandChat = document.getElementsByClassName('expandChat')[0];
expandChat.addEventListener('click' , expandedChat);

textMessage = document.getElementsByClassName('textMessage')[0];

function debounce(func, wait = 3000) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);

        socket.emit("typing:start",{ActiveUser:ActiveUser.id, chatId});
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit("typing:stop",{ActiveUser:ActiveUser.id1, chatId});
        }, 1000);

        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, wait);
    };
}

function Suggestion() {

    if(textMessage.value.length == 0){
        if(AskAI.classList.contains('d-none')){
            AskAI.classList.remove('d-none');
            AskAI.classList.add('d-block');
        }
    }else{

        if(AskAI.classList.contains('d-block')){
            AskAI.classList.remove('d-block');
            AskAI.classList.add('d-none');
        }

        if(textMessage.value.length >= 0 && textMessage.value[textMessage.value.length - 1] == " "  ){
            // axios.post("http://localhost:3000/api/v1/message/AIWordSuggestion" , {text:textMessage.value} , {headers: { authToken: JSON.parse(localStorage.getItem('token')) }}).then((response) => {
            //     let suggestionWord = JSON.parse(response.data.data);
                
            //     const suggestionElements = [
            //         document.getElementsByClassName('suggestionText1')[0],
            //         document.getElementsByClassName('suggestionText2')[0],
            //         document.getElementsByClassName('suggestionText3')[0]
            //     ];

            //     suggestionElements.forEach((element, index) => {
            //         element.innerText = suggestionWord[index];

            //         element.classList.remove('d-none');
            //         element.classList.add('d-block');

            //         element.onclick = function () {
            //             textMessage.value += (textMessage.value.endsWith(' ') ? '' : ' ') + element.innerText;

            //             suggestionElements.forEach(el => {
            //                 el.classList.remove('d-block');
            //                 el.classList.add('d-none');
            //             });
            //         };
            //     });
            // }).catch((error) => {
            //     console.log(error);
            // });

        }else if(textMessage.value.length >= 0 &&  textMessage.value[textMessage.value.length - 1] == ","){
            // axios.post("http://localhost:3000/api/v1/message/AIWordSuggestion" , {text:textMessage.value}, {headers: { authToken: JSON.parse(localStorage.getItem('token')) }}).then((response) => {
            //     let suggestionWord = JSON.parse(response.data.data);

            //     const suggestionElements = [
            //         document.getElementsByClassName('suggestionText1')[0],
            //         document.getElementsByClassName('suggestionText2')[0],
            //         document.getElementsByClassName('suggestionText3')[0]
            //     ];

            //     suggestionElements.forEach((element, index) => {
            //         element.innerText = suggestionWord[index];

            //         element.classList.remove('d-none');
            //         element.classList.add('d-block');

            //         element.onclick = function () {
            //             textMessage.value += (textMessage.value.endsWith(' ') ? '' : ' ') + element.innerText;

            //             suggestionElements.forEach(el => {
            //                 el.classList.remove('d-block');
            //                 el.classList.add('d-none');
            //             });
            //         };
            //     });
            // }).catch((error) => {
            //     console.log(error);
            // });
        } 
        else if(textMessage.value.length >= 0 && ( textMessage.value[textMessage.value.length - 1] == "?" || textMessage.value[textMessage.value.length - 1] == "!" || textMessage.value[textMessage.value.length - 1] == "." )){
            console.log("Call Ai for suggestion");
        }
    }

}

textMessage.addEventListener('input', debounce(Suggestion, 3000));

let changeText;

let chat;

let AIText;

function changeAIText(){
    let textId = AIText.dataset.textId;

    if(textId == 0){
        AIText.innerHTML = chat[1];
        AIText.dataset.textId = 1;
    }else if(textId == 1){
        AIText.innerHTML = chat[2];
        AIText.dataset.textId = 2;
    }else if(textId == 2){
        AIText.innerHTML = chat[0];
        AIText.dataset.textId = 0;
    }

    return true;
}

function AskAI_Fun(){

    axios.post("http://localhost:3000/api/v1/message/AISuggestion" , {userId,chatId:JSON.parse(sessionStorage.getItem('chatId'))} , {headers: { authToken: JSON.parse(localStorage.getItem('token')) }}).then((response) => {
        chat = JSON.parse(response.data.data);
        changeText = document.getElementsByClassName('changeText')[0];
        changeText.addEventListener('click' , changeAIText);
        AIText = document.getElementsByClassName('AIText')[0];
        AIText.addEventListener('click' , function(){
            textMessage.value = AIText.innerHTML;
            
            changeText.classList.remove('d-block');
            changeText.classList.add('d-none');
            
            AIText.classList.remove('d-block');
            AIText.classList.add('d-none');

        });
        AIText.classList.remove('d-none');
        AIText.classList.add('d-block');
        AIText.innerHTML = chat[0];
        AIText.dataset.textId = 0;
        changeText.classList.remove('d-none');
        changeText.classList.add('d-block');
        AskAI.classList.add('d-none');
    }).catch((error) => {
        console.log(error);
    });
    
}




