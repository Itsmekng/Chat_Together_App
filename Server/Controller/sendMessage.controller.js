const { v4 } = require('uuid');
const { Users, ChatMember, ChatType, ChatMessage } = require('../Model');
const { Op, where, Sequelize } = require('sequelize');
const chatMessage = require('../Model/chatMessage.model');
const ApiError = require('../Utils/ApiError.utils');

const newChat = async (req , res , next) => {

    try{    
        const userId = req.userDetails.userId;

        const { receiverNumber } = req.body;

        const receiver = await Users.findOne({
            where:{
                number: receiverNumber
            }
        });

        if(!receiver){
            throw new ApiError(409,"User not found !")
        }

        if(userId == receiver.id){
            throw new ApiError(409,"Self chat is not available !");
        }

        const existingChat = await ChatMember.findOne({
            attributes: ["ChatTypeId"],
            where: {
                UserId: {
                [Op.in]: [userId, receiver.id]
                }
            },
            group: ["ChatTypeId"],
            having: Sequelize.literal("COUNT(DISTINCT ChatMember.UserId) = 2"),
            include: [{
                model: ChatType,
                as: "ChatType",
                where: {
                    chatType: "personal"
                },
                attributes: []
            }]
        });

        if(existingChat){
            return res.success(existingChat.ChatTypeId,"Chat Existed !",200)
        }

        const newChat = await ChatType.create({
            UserId: userId
        });

        await ChatMember.bulkCreate([
            {
                UserId: userId,
                ChatTypeId: newChat.id
            },
            {
                UserId: receiver.id,
                ChatTypeId: newChat.id
            }
        ]);

        return res.success(newChat.id,"Chat created",201);

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

const getReceiverDetails = async (req , res , next) => {

    const { chatId } = req.body;

    const userId = req.userDetails.userId;

    const receiverDetails = await ChatMember.findOne({
        where: {
            ChatTypeId: chatId,
            UserId: {
                [Op.ne]: userId
            }
        },
        include: [{
            model: Users
        }]
    });

    return res.success(receiverDetails,"data fetch !",200);

};

const getAllChat = async ( req , res , next ) => {
    const { chatIds } = req.body;
    console.log(chatIds);
    // const chatData = PersonalChat.findAll({
    //     attributes: [ 'receiverNumber' ],
    //     where:{
    //         receiverNumber:{
    //             [Op.in]: chatIds
    //         }
    //     }
    // });

    // console.log(chatData);

    res.end();
}

module.exports = {
    newChat, sendMessage, getMessage, getReceiverDetails, getAllChat
}