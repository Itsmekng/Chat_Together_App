const { Sequelize , DataTypes } = require('sequelize');
const sequelize = require('../DB/connection.js');

const ChatMember = sequelize.define('ChatMember',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false
    },
    role:{
        type:DataTypes.STRING,
        defaultValue:"member"
    }
});

module.exports = ChatMember;