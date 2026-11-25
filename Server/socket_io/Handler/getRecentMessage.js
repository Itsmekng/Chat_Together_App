const { ChatType, ChatMessage, Users, ArchivedChat } = require("../../Model");
const { Op } = require("sequelize");

module.exports = (io, socket) => {

    socket.on("getRecentMessage", async ({ chatId, cursor }) => {
        try {
            const limit = 5;

            const recentMessages = await ChatMessage.findAll({
                where: {
                    ChatTypeId: chatId,
                    ...(cursor && {
                        createdAt: { [Op.lt]: new Date(cursor) }
                    })
                },
                include: [{ model: Users }],
                order: [['createdAt', 'DESC']],
                limit: limit + 1
            });

            const archivedMessages = await ArchivedChat.findAll({
                where: {
                    ChatTypeId: chatId,
                    ...(cursor && {
                        chatDate_time: { [Op.lt]: new Date(cursor) }
                    })
                },
                include: [{ model: Users }],
                order: [['chatDate_time', 'DESC']],
                limit: limit + 1
            });

            // Make both tables use the same structure
            const activeData = recentMessages.map(message => ({
                id: message.id,
                message: message.message,
                message_type: message.message_type,
                file_url: message.file_url,
                status: message.status,
                UserId: message.UserId,
                ChatTypeId: message.ChatTypeId,
                User: message.User,
                createdAt: message.createdAt,
                seenUser: message.seenUser,
            }));

            const archivedData = archivedMessages.map(message => ({
                id: message.id,
                message: message.message,
                message_type: message.message_type,
                file_url: message.file_url,
                status: message.status,
                UserId: message.UserId,
                ChatTypeId: message.ChatTypeId,
                User: message.User,
                createdAt: message.chatDate_time
            }));

            // Combine and sort
            const allMessages = [...activeData, ...archivedData]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            const chatMessages = allMessages.slice(0, limit);

            const nextCursor = chatMessages.length
                ? chatMessages[chatMessages.length - 1].createdAt
                : null;

            const hasMore = allMessages.length > limit;
            socket.emit("getRecentMessage", {
                chatMessages,
                nextCursor,
                hasMore: hasMore
            });
        } catch (err) {
            console.log(err);
        }
    });

};