const { ChatMessage } = require("../../Model");

module.exports = (io,socket,activeUser) => {
    socket.on("new-message",async ({message,chatId,chatType,userId,message_type}) => {
        try{
            let chatMessage;

            if(chatType == "group"){
                let Userstatus;
                let seenUserId;
                if(activeUser.length == userId.length){
                    Userstatus ="read"
                    userId.sort((a, b) => a - b);
                    seenUserId=activeUser.join();
                }else{
                    Userstatus ="pending"
                    userId.sort((a, b) => a - b);
                    seenUserId=activeUser.join();
                }

                chatMessage = await ChatMessage.create({
                    message,
                    ChatTypeId:chatId,
                    UserId:socket.user?.userId,
                    status:Userstatus,
                    message_type:message_type == "file" ? "file" : "text",
                    seenUser:seenUserId
                });
            }else{
                if(activeUser.indexOf(userId) >= 0){
                    chatMessage = await ChatMessage.create({
                        message,
                        ChatTypeId:chatId,
                        UserId:socket.user?.userId,
                        status:"read",
                        message_type:message_type == "file" ? "file" : "text"
                    });
                }else{
                    chatMessage = await ChatMessage.create({
                        message,
                        ChatTypeId:chatId,
                        UserId:socket.user?.userId,
                        message_type:message_type == "file" ? "file" : "text"
                    });
                }
            }

            io.emit("notifyNewChat", {chatId, userId, chatType});
            io.to(String(chatId)).emit("new-message",{ chatId,chatType,userNumber:socket.user?.userNumber, message ,createdAt:chatMessage.createdAt,status:chatMessage.status,message_type,senderName:socket.user?.userName,seenUser:chatMessage.seenUser });
        }catch(err){
            console.log(err);
        }
    });
};