module.exports = (io, socket) => {

    socket.on("chatIds", async (chatId) => {

        try {
            if (!Array.isArray(chatId) || chatId.length === 0) {
                return socket.emit("chatId", []);
            }
            // Join all personal chat rooms
            chatId.forEach((id) => {
                socket.join(String(id));
            });

            io.emit("chatIds", "connected to all chat");

        } catch (error) {
            console.error(error);
        }
    });
};