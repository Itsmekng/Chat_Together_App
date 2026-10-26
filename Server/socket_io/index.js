const { Server } = require('socket.io');
const auth = require('./Auth/auth');

module.exports = (server) => {
    const io = new Server(server,{
        cors:{
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // auth(io,server);

    io.on('connection', (socket) => {
    // console.log(socket.user.userName);

    socket.on('message',(message) => {
        console.log(message);
        io.emit('message',message);
    });
})
}
