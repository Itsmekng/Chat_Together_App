const { Users } = require('./user.model');
const chatMessage = require('./chatMessage.model.js')
const personalChat = require('./personalChat.model');

personalChat.hasMany(chatMessage);
chatMessage.belongsTo(personalChat);

Users.hasMany(chatMessage);
chatMessage.belongsTo(Users);

module.exports = {
    personalChat,
    Users
}

