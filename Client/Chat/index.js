window.addEventListener('load',connectToServer);

function connectToServer(){

    if(localStorage.getItem('token') == null){
        window.location.href = '../AuthenticateUserPage/signUp.html';
    };

    const socket = io('ws://localhost:3000',{
        auth:{
            token:localStorage.getItem('token')
        }
    });

    socket.emit('message',"hello");
    
    socket.on("message", (message) => {
        console.log(message);
    });

}