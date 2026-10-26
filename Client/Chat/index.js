window.addEventListener('load',connectToServer);

function connectToServer(){
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