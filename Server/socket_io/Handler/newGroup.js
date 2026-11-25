const { ChatType } = require("../../Model")

module.exports = (io,socket) => {
    socket.on('newGroup', async ({groupId}) => {
        const groupData = await ChatType.findOne({
            id:groupId
        });
    })
}