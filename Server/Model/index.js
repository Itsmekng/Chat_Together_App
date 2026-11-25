const ChatMember = require('./chatMember.model.js');
const { Users } = require('./user.model.js');
const ChatMessage = require('./chatMessage.model.js');
const ChatType = require('./chatType.model.js');
const ArchivedChat = require('./archivedChat.model.js');


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

// Archived Chat associations
Users.hasMany(ArchivedChat);
ArchivedChat.belongsTo(Users);

ChatType.hasMany(ArchivedChat);
ArchivedChat.belongsTo(ChatType);


module.exports = {
    ChatMember,
    Users,
    ChatMessage,
    ChatType,
    ArchivedChat
};