const ChatMember = require('./chatMember.model.js');
const { Users } = require('./user.model.js');
const ChatMessage = require('./chatMessage.model.js');
const ChatType = require('./chatType.model.js');


Users.hasMany(ChatType);
ChatType.belongsTo(Users);

Users.hasMany(ChatMember);
ChatMember.belongsTo(Users);

Users.hasMany(ChatMessage);
ChatMessage.belongsTo(Users);

ChatType.hasMany(ChatMember);
ChatMember.belongsTo(ChatType);

ChatType.hasMany(ChatMessage);
ChatMessage.belongsTo(ChatType);

module.exports = {
    ChatMember,
    Users,
    ChatMessage,
    ChatType
}