const { Server } = require('socket.io');
const auth = require('./Auth/auth.js');
const chatHandler = require('./Handler/chatHandler.js');
const personalChat = require('./Handler/personalChat.js');

module.exports = (server) => {
    const io = new Server(server,{
        cors:{
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    
    io.on('connection', (socket) => {
        auth(io,socket);

        chatHandler(io,socket);

        personalChat(io,socket);
    });
}
