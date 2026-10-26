module.exports = (io,socket) => {
    socket.on('message',(message) => {
        console.log(message);
        io.emit('message',message);
    });
}

