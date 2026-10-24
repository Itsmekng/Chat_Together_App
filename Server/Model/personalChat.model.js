const { Sequelize , DataTypes } = require('sequelize');
const sequelize = require('../DB/connection.js');

const personalChat = sequelize.define('personalChat' , {
    id:{
        type:DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    chatID:{
        type:DataTypes.STRING,
        allowNull:false
    },
    senderId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    receiverId:{
        type:DataTypes.INTEGER,
        allowNull:false
    }
});

module.exports = personalChat;