const express = require('express');
const router = express.Router();
const { newChat, sendMessage,getMessage, getReceiverDetails, AISuggestion, AIWordSuggestion, startCronJob, checkUserByNumber, newGroup } = require('../Controller/sendMessage.controller.js');
const AuthUser = require('../Middleware/auth.middleware.js');

router.post('/newChat', AuthUser,newChat);
router.post('/newGroup', AuthUser,newGroup);
router.post('/sendMessage',sendMessage);
router.post('/getMessage',getMessage);
router.post('/getDetails', AuthUser,getReceiverDetails);
router.post('/AISuggestion', AuthUser,AISuggestion);
router.post('/AIWordSuggestion', AuthUser,AIWordSuggestion);
router.post('/startCronJob',startCronJob);
router.post('/checkUserByNumber', AuthUser, checkUserByNumber);

module.exports = router;