const { Op, Sequelize } = require("sequelize");
const { ChatType, ChatMessage, ChatMember, Users } = require("../../Model");


module.exports = (io,socket) => {
    socket.on("groupChat", async (chatId) => {
        const chats = await ChatType.findAll({
            where: {
                id: chatId
            },
            include: [
                {
                    model: ChatMessage,
                    separate: true,
                    order: [["createdAt", "DESC"]],
                    limit: 1,
                    include: [
                        {
                            model: Users,
                            foreignKey: "UserId"
                        }
                    ]
                }
            ]
        });

        const pendingChatCount = await ChatMessage.findAll({
            attributes: [
                'ChatTypeId',
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'pendingCount']
            ],
            where: {
                ChatTypeId: chatId,
                status: "pending"
            },
            group: ['ChatTypeId'],
            raw: true
        });

        const finalPendingChatCount = chatId.map(id => ({
            ChatTypeId: id,
            pendingCount: Number(
                pendingChatCount.find(item => item.ChatTypeId == id)?.pendingCount || 0
            )
        }));

        socket.emit("groupChat", {chats , pendingChatCount:finalPendingChatCount});
    });
}