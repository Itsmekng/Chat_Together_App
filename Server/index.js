const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const server = http.createServer(app);
// const connection = require('./DB/connection.js');
const bodyParser = require('body-parser');
const cors = require('cors');
const { verifyToken } = require('./Model/user.model');
// require('./Model/index.js');

// app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

// const userRoutes = require('./Router/user.router.js');
// const messageRouter = require('./Router/message.router.js');
// const responseHandler = require('./Middleware/response.middleware.js');
// const errorHandler = require('./Middleware/error.middleware.js');

// app.use(responseHandler);
// app.use("/api/v1/user",userRoutes);
// app.use("/api/v1/message",messageRouter);
// app.use(errorHandler);

const io = new Server(server,{
    cors:{
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

io.use((socket , next) => {
    try{
        const token = socket.handshake.auth.token;
    
        const user = verifyToken(token);

        socket.user = user;

        next();
    }catch(err){
        return next(new Error(err));
    }


})

io.on('connection', (socket) => {
    console.log(socket.user.userName);

    socket.on('message',(message) => {
        console.log(message);
        io.emit('message',message);
    });
})

server.listen(3000,() => {
    console.log('socket io server is running on port:' ,3000);
})

// connection.sync({force: true}).then(() =>{
//     const port = 3000;
//     app.listen(port, () => {
//         console.log("Server listen on localhost port:" ,port)
//     })
// }).catch((err) =>{
//     console.log(err);
//     process.exit(1);
// });
