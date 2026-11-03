const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../DB/connection.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { now } = require('sequelize/lib/utils');

const Users = sequelize.define("Users" ,{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey:true,
        allowNull:false
    },
    full_name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    number:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    profile_pic:{
        type: DataTypes.STRING,
        allowNull: true
    },
    is_online:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    last_seen:{
        type: DataTypes.DATE,
        allowNull: true
    }
    
});

const hashPassword = (myPlaintextPassword) => {
    return bcrypt.hash(myPlaintextPassword, 10);
}

const comparePassword = (myPlaintextPassword, hash) => {
    return bcrypt.compare(myPlaintextPassword, hash)
}

const getToken = (userId, userName, userNumber) => {
    return jwt.sign({ userId, userName, userNumber }, 'shhhhh');
}

const verifyToken = (token) => {
    return jwt.verify(token, 'shhhhh');
}


module.exports = { Users, hashPassword, comparePassword, getToken, verifyToken};