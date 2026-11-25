const { Server } = require('socket.io');
const auth = require('./Auth/auth.js');
const chatHandler = require('./Handler/chatHandler.js');
const personalChat = require('./Handler/personalChat.js');
const getAllSocketId = require('./Handler/getAllSocketId.js');
const AllChat = require('./Handler/AllChat.js');
const getRecentMessage = require('./Handler/getRecentMessage.js');
const activeUsers = require('./Handler/activeUsers.js');
const inactiveUser = require('./Handler/inactiveUser.js');
const typingNotification = require('./Handler/typingNotification.js');
const Allgroup = require('./Handler/Allgroup.js');

module.exports = (server) => {
    const io = new Server(server,{
        cors:{
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    let onlineUsers = [];
    let activeUser = [];
    
    io.on('connection', (socket) => {

        auth(io,socket);

        if(!onlineUsers.includes(socket.user?.userId)){
            if(!(socket.user?.userId == null)){
                onlineUsers.push(socket.user?.userId);
            }
        }

        activeUsers(io,socket,activeUser);

        typingNotification(io,socket);

        getRecentMessage(io,socket);
        
        AllChat(io,socket);
        
        Allgroup(io,socket);
        
        getAllSocketId(io,socket);
        
        chatHandler(io,socket);
        
        personalChat(io,socket,activeUser);

        setTimeout(() =>{
            io.emit('onlineUser',onlineUsers);
        },2000)
        
        inactiveUser(io,socket,activeUser);

        socket.on('disconnect', () =>{
            const userId = socket.user?.userId;
            onlineUsers = onlineUsers.filter(id => id !== userId);
            io.emit('OfflineUser', {
                userId
            });
        });
    });
}

// pp and http.createServer(app) are different, but they work together. Let's understand this using Express and Socket.IO.
// 1. What is app?
// const express = require("express");
// const app = express();


// app is your Express application. It handles HTTP requests using routes and middleware.
// app.get("/", (req, res) => {
//     res.send("Hello World");
// });


// When someone visits /, Express handles the request and sends the response.
// 2. What is http.createServer(app)?
// const http = require("http");

// const server = http.createServer(app);


// This creates a Node.js HTTP server and attaches your Express application to it.




// Why do we need both for Socket.IO?
// Socket.IO attaches to the HTTP server, not directly to the Express application.
// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");

// const app = express();

// // Create HTTP server using Express
// const server = http.createServer(app);

// // Attach Socket.IO to the HTTP server
// const io = new Server(server);

// app.get("/", (req, res) => {
//     res.send("Express is working!");
// });

// io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);
// });

// // Start the HTTP server
// server.listen(3000, () => {
//     console.log("Server running on port 3000");
// });


// Now the same HTTP server handles both:
// - Express: REST API requests such as /api/users.
// - Socket.IO: Real-time events such as send-message and receive-message.
// 4. What if you use app.listen() instead?
// Normally, this is enough for an Express-only application:
// app.listen(3000);


// But if you want Socket.IO to share that same server, explicitly create the HTTP server and call server.listen() instead.

// Avoid this pattern:
// const server = http.createServer(app);

// app.listen(3000); // Wrong for this setup


// Why? app.listen() creates and starts a separate HTTP server. Your Socket.IO instance is attached to server, which is not the server you started.

// Remember this mental model:
// - app = defines how requests are handled.
// - http.createServer(app) = creates the actual HTTP server around your Express app.
// - server.listen(3000) = starts listening for network connections.
// - io = new Server(server) = adds real-time Socket.IO communication to that server.