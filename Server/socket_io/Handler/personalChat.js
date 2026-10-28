module.exports = (io,socket) => {
    socket.on("join-room",(roomName) => {
        socket.join(roomName);
    });

    socket.on("new-message",({message,roomName}) => {
        console.log('User',socket.user?.userName,"said:",message);

        io.emit("new-message",{ username: socket.user?.userName, message});
    });
};