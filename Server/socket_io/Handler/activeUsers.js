const { Op } = require("sequelize");
const { ChatMessage } = require("../../Model");

module.exports = (io,socket,activeUser) =>{
    socket.on("ActiveUser",async ({ActiveUser,chatId,userId}) => {
        try{
            if(!activeUser.includes(ActiveUser)){
                if(!(ActiveUser == null)){
                    activeUser.push(ActiveUser);
                }
            }

            if(activeUser.includes(ActiveUser)){
                if(Array.isArray(userId)){

                    let lastMessage = await ChatMessage.findOne({
                        where:{
                            ChatTypeId:chatId,
                            status:"pending"
                        },
                        order: [['id', 'DESC']],
                        limit:1
                    });

                    if(!(lastMessage == null)){
                        let seenUser = lastMessage.seenUser.split(',').map(Number);
                        let newSeenUser = activeUser.filter(num => !seenUser.includes(num));

                        if(!(newSeenUser[0] == undefined)){
                            seenUser = [...seenUser,...newSeenUser].sort((a,b) => a - b );
                            if(seenUser.length == userId.length){
                                await ChatMessage.update(
                                    { status: 'read', seenUser:seenUser.join() },{
                                        where:{
                                            status: 'pending',
                                            id:lastMessage.id
                                        }
                                    }
                                );
                            }else{
                                await ChatMessage.update(
                                    { seenUser:seenUser.join() },{
                                        where:{
                                            status: 'pending',
                                            id:lastMessage.id
                                        }
                                    }
                                )
                            };
                        }
                    };
                }else{
                    await ChatMessage.update({
                        status:"read"
                    },{
                        where:{
                            ChatTypeId:chatId,
                            UserId:userId
                        }
                    });
                }
            }
            
            io.emit("ActiveUser",activeUser);

        }catch(err){
            console.log(err);
        }
    });
}