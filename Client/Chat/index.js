window.addEventListener('load',connectToServer);

function connectToServer(){
    const socket = io('http://localhost:3000');

    socket.on("connect", () => {
        console.log("Connected with ID:", socket.id);
    });
}