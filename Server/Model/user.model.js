const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../DB/connection.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
        allowNull:false
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    }
    
});

const hashPassword = (myPlaintextPassword) => {
    return bcrypt.hash(myPlaintextPassword, 10);
}

const comparePassword = (myPlaintextPassword, hash) => {
    return bcrypt.compare(myPlaintextPassword, hash)
}

const getToken = (userId, userName) => {
    return jwt.sign({ userId, userName }, 'shhhhh');
}

const verifyToken = (token) => {
    return jwt.verify(JSON.parse(token), 'shhhhh');
}


module.exports = { Users, hashPassword, comparePassword, getToken, verifyToken};