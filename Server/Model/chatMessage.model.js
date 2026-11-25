const { Sequelize , DataTypes } = require('sequelize');
const sequelize = require('../DB/connection.js');

const ChatMessage = sequelize.define('chatMessage',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:true,
        allowNull:false
    },
    message:{
        type:DataTypes.STRING,
        allowNull:false
    },
    message_type:{
        type:DataTypes.STRING,
        defaultValue:"Text"
    },
    file_url:{
        type:DataTypes.STRING,
        allowNull:true
    },
    status:{
        type:DataTypes.STRING,
        defaultValue:"pending",
        allowNull:false
    },
    seenUser:{
        type:DataTypes.STRING,
        allowNull:true
    }
});

module.exports = ChatMessage;