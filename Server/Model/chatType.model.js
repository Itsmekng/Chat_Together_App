const { Sequelize , DataTypes } = require('sequelize');
const sequelize = require('../DB/connection.js');

const ChatType = sequelize.define('ChatType' , {
    id:{
        type:DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    chatType:{
        type:DataTypes.STRING,
        defaultValue: "personal"
    },
    chatName:{
        type:DataTypes.STRING,
        allowNull:true
    }
});

module.exports = ChatType;