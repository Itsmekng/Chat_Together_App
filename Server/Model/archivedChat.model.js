const { Sequelize , DataTypes } = require('sequelize');
const sequelize = require('../DB/connection.js');

const ArchivedChat = sequelize.define('ArchivedChat',{
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
    chatDate_time:{
        type:DataTypes.DATE,
        allowNull:false
    },
    ChatTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    UserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = ArchivedChat;