const { ChatType, ChatMessage } = require("../../Model")

module.exports = (io,socket) => {
    socket.on("getRecentMessage" ,async(chatId) => {
        try{
            const data = await ChatType.findOne({
                where:{
                    id:chatId
                },
                include:{
                    model:ChatMessage,
                    limit:5,
                    order: [['createdAt', 'DESC']]
                }
            });

            socket.emit("getRecentMessage",data);
        }catch(err){
            console.log(err);
        }
    })
}