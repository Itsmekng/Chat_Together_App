const uuidv4 = require('uuid');
const { personalChat } = require('../Model');
const { Op } = require('sequelize');
const chatMessage = require('../Model/chatMessage.model');
const ApiError = require('../Utils/ApiError.utils');

const newChat = async (req , res , next) => {

    try{
        const {senderId , receiverId} = req.body;
    
        const chatIDExist = await personalChat.findOne({
            where:{
                [Op.or]:[
                    {senderId , receiverId},
                    {receiverId , senderId}
                ]
            }
        });
        
        if(chatIDExist){
            req.success(chatIDExist.chatID,'Chat Existed',200);
        };
        
        const chatID = uuidv4();
    
        const newChat = await personalChat.create({
            senderId , receiverId , chatID
        })
    
        return req.success(newChat.chatID,'Chat Existed',200);

    }catch(err){
        next(err);
    }
};

const sendMessage = async(req , res , next) => {
    try{
        const {senderId, message, personalChatId} = req.body;
    
        await chatMessage.create({
            UserId:senderId,
            message,
            personalChatId
        });
    
        res.success(null,"success",201);
    }catch(err){
        next(err);
    }
}

const getMessage = async (req , res, next) => {

    try{
        const { personalChatId } = req.body;
    
        const getMessage = await chatMessage.findAll({ 
            where: { personalChatId }, 
            order: [ ['createdAt', 'DESC'] ], 
            limit: 10 
        });
    
        if(!getMessage){
            throw new ApiError(404,"not chat found");
        }
    
        return res.success(getMessage,"success",200);
    }catch(err){
        next(err);
    };
}

module.exports = {
    newChat, sendMessage, getMessage
}