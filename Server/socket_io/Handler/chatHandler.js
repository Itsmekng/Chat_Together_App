module.exports = (io,socket) => {
    socket.on('message',(message) => {
        io.emit('message',`${message} from ${socket.user?.userName}`);
    });
};