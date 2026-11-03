const { ChatMessage } = require("../../Model");

module.exports = (io,socket,activeUser) => {
    socket.on("new-message",async ({message,chatId,userId}) => {
        try{

            let chatMessage;

            if(activeUser.indexOf(userId) >= 0){
                chatMessage = await ChatMessage.create({
                    message,
                    ChatTypeId:chatId,
                    UserId:socket.user?.userId,
                    status:"read"
                });
            }else{
                chatMessage = await ChatMessage.create({
                    message,
                    ChatTypeId:chatId,
                    UserId:socket.user?.userId
                });
            }

            io.to(chatId).emit("new-message",{ chatId,userNumber:socket.user?.userNumber, message ,createdAt:chatMessage.createdAt,status:chatMessage.status });
        }catch(err){
            console.log(err)
        }
    });
};