const { v4 } = require('uuid');
const { Users, ChatMember, ChatType, ChatMessage } = require('../Model');
const { Op, where, Sequelize } = require('sequelize');
const ApiError = require('../Utils/ApiError.utils');
const getAiResponse = require('../Services/gemini.services');
const { job, CronJobByCall} = require('../CronJob/ArchivedChat');

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

const newGroup = async (req , res , next) => {

    try{
        const {groupName , member} = req.body;
    
        const newGroup = await ChatType.create({
            chattype: "group",
            chatName:groupName,
            UserId:req.userDetails.userId,
            chatType:"group"
        });
    
        const chatMembersData = [
            ...member.map((userId) => ({ ChatTypeId: newGroup.id, UserId: userId })),
            { ChatTypeId: newGroup.id, UserId: req.userDetails.userId }
        ];

        await ChatMember.bulkCreate(chatMembersData);
    
        res.success(newGroup,"Group created",201);
    }catch(err){
        next(err);
    }

}

const checkUserByNumber = async(req , res, next) => {
    try{

        const { receiverNumber } = req.body;
        if(receiverNumber == req.userDetails.userNumber){
            throw new ApiError(409,"You cannot add yourself to the group. Please choose another user.");
        };

        const existedUser = await Users.findOne({
            where:{
                number: receiverNumber
            }
        });
        
        if(!existedUser){
            throw new ApiError(409,"User not found");
        }
        
        res.success(existedUser,"User found",200);
    }catch(err){
        next(err);
    }

}

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

    const chatType = await ChatType.findOne({
        where:{
            id:chatId
        }
    });

    let receiverDetails;

    if(chatType.chatType == "personal"){
        receiverDetails = await ChatMember.findOne({
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
    }else{
        receiverDetails = await ChatMember.findAll({
            where: {
                ChatTypeId: chatId
            },
            include: [{
                model: Users
            }]
        });
    }


    return res.success({receiverDetails ,chatType},"data fetch !",200);

};

const AISuggestion = async (req , res , next) => {

    const { userId } = req.body;

    const senderId = req.userDetails.userId;

    const userChat = await ChatMessage.findAll({
        attributes: ["message", "message_type", "createdAt"],
        where: { UserId: userId },
        order: [["createdAt", "DESC"]],
        limit: 5
    });

    const senderChat = await ChatMessage.findAll({
        attributes: ["message", "message_type", "createdAt"],
        where: { UserId: senderId },
        order: [["createdAt", "DESC"]],
        limit: 5
    });

    const conversationHistory = [...userChat, ...senderChat]
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));


    const prompt = `
        You are an AI smart reply assistant for a messaging application.

        TASK:
        Generate exactly 3 short, natural, and relevant reply suggestions
        based on the latest incoming message.

        CONVERSATION HANDLING:
        - Analyze the latest incoming message first.
        - Use previous conversation messages only when available.
        - If conversation history is empty, generate replies using only
        the incoming message.
        - Never assume that you know the sender or the user's relationship.
        - For a new conversation, use a friendly and neutral tone.
        - Do not mention that conversation history is empty.

        PERSONALIZATION:
        - Analyze the user's previous messages to understand their writing style.
        - Match their usual tone, vocabulary, and message length.
        - Adapt emoji usage based on their previous messages.
        - If no previous user messages exist, use a natural conversational style.

        MESSAGE TYPES:
        - Text: Understand and respond to the message normally.
        - Image: If image content is unavailable, do not assume what the
        image contains. Suggest general replies such as asking about it.
        - Video: If video content is unavailable, do not assume its contents.
        - Other media: Respond appropriately without inventing content.

        RULES:
        1. Generate exactly 3 suggestions.
        2. Keep replies short and conversational.
        3. Make each suggestion meaningfully different.
        4. Never invent facts or personal information.
        5. Do not automatically agree or make commitments for the user.
        6. Avoid robotic or repetitive responses.
        7. Return ONLY a valid JSON array of 3 strings.
        8. No markdown or explanations.

        INPUT:

        LATEST INCOMING MESSAGE:
        ${JSON.stringify(senderChat[0] || null)}

        CONVERSATION HISTORY:
        ${JSON.stringify(conversationHistory)}

        USER'S PREVIOUS MESSAGES (FOR STYLE):
        ${JSON.stringify(userChat)}

        OUTPUT FORMAT:
        [
            "Yes, I'll be there!",
            "Sounds good 😊",
            "Can we discuss this later?"
        ]
        `;

        const response = await getAiResponse(prompt);

        if(!response?.output_text){
            throw new ApiError(500,"Something went wrong !!!");
        }
    
        return res.success(response.output_text,"Get reply",200);

}

const AIWordSuggestion = async (req , res , next) => {

    const { text } = req.body;

    const prompt = `You are an AI predictive typing assistant for a chat application.
        Your task is to analyze the user's partially typed message and suggest exactly 3 natural and relevant next words or short phrases that could logically continue the message.

        Input text: "${text}"

        Rules:
        1. Generate exactly 3 different suggestions.
        2. Suggestions must naturally continue the user's existing text.
        3. Keep suggestions short (1–5 words).
        4. Understand the context and intent of the message.
        5. Use natural, conversational language.
        6. Avoid repeating words or phrases already present in the input.
        7. Suggestions should sound like something a real person would type in a chat.
        8. Adapt to the user's tone (casual, formal, friendly, etc.).
        9. Do not generate complete unrelated sentences.
        10. Return ONLY a valid JSON array of 3 strings.
        11. Do not include explanations, markdown, or any additional text.

        Example:
        Input: "Let's meet at"

        Output:
        ["5 pm", "the office", "tomorrow"]`;

        const response = await getAiResponse(prompt);

        if(!response?.output_text){
            throw new ApiError(500,"Something went wrong !!!");
        }
    
        return res.success(response.output_text,"Get reply",200);
};

const startCronJob = (req , res , next) => {
    CronJobByCall();
    res.success(null,"CronJob end",200);
}

module.exports = {
    newChat, sendMessage, getMessage, getReceiverDetails, AISuggestion, AIWordSuggestion, startCronJob, checkUserByNumber, newGroup
}