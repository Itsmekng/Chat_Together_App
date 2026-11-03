const { Op } = require("sequelize");
const { ChatType, ChatMessage, ChatMember, Users } = require("../../Model");


module.exports = (io,socket) => {
    socket.on("AllChat", async (chatId) => {
        const chats = await ChatType.findAll({
            where: {
                id: chatId
            },
            include: [{
                model: ChatMessage,
                separate: true,
                order: [["createdAt", "DESC"]],
                limit: 1
                }
            ]
        });
            
        const chatMembers = await ChatMember.findAll({
            where:{
                ChatTypeId: chatId,
                UserId:{
                    [Op.ne]:socket.user?.userId
                }
            },
            include:Users
        });

        socket.emit("AllChat", {chats ,chatMembers});
    });
}