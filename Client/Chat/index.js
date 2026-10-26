window.addEventListener('load',connectToServer);

function connectToServer(){
    const socket = io('ws://localhost:3000');

    socket.emit('message',"hello");
    
    socket.on("message", (message) => {
        console.log(message);
    });

}