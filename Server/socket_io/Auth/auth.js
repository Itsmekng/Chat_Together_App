module.exports = (io,socket) => {
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
};

