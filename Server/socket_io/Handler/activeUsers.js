const { ChatMessage } = require("../../Model");

module.exports = (io,socket,activeUser) =>{
    socket.on("ActiveUser",async ({ActiveUser,chatId,userId}) => {
        try{

            if(!activeUser.includes(ActiveUser)){
                if(!(ActiveUser == null)){
                    activeUser.push(ActiveUser);
                }
            }

            if(activeUser.indexOf(userId) >= 0){
                await ChatMessage.update({
                    status:"read"
                },{
                    where:{
                        ChatTypeId:chatId,
                        UserId:userId
                    }
                });
            }
            
            io.emit("ActiveUser",activeUser);

        }catch(err){
            console.log(err);
        }
    })
}