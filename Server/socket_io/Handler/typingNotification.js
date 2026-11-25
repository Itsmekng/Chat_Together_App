module.exports = (io,socket) => {
    socket.on("typing:start", ({ActiveUser ,chatId}) => {
        socket.to(chatId).emit("typing:update", { ActiveUser, isTyping: true });
    });

    // When a user stops typing or clears input
    socket.on("typing:stop", ({ActiveUser ,chatId}) => {
        socket.to(chatId).emit("typing:update", { ActiveUser, isTyping: false });
    });
}