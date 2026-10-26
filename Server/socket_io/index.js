const { Server } = require('socket.io');
const auth = require('./Auth/auth');
const chatHandler = require('./Handler/chatHandler');

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

        chatHandler(io,socket);
    })
}
