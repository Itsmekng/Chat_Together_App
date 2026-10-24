const { Sequelize , DataTypes } = require('sequelize');
const sequelize = require('../DB/connection.js');

const chatMessage = sequelize.define('chatMessage',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false
    },
    message:{
        type:DataTypes.STRING,
        allowNull:false
    },
    status:{
        type:DataTypes.STRING,
        defaultValue:"pending",
        allowNull:false
    },
});

module.exports = chatMessage;