const express = require('express');
const router = express.Router();
const { newChat, sendMessage,getMessage, getReceiverDetails, getAllChat } = require('../Controller/sendMessage.controller.js');
const AuthUser = require('../Middleware/auth.js');

router.post('/newChat', AuthUser,newChat);
router.post('/sendMessage',sendMessage);
router.post('/getMessage',getMessage);
router.post('/getDetails', AuthUser,getReceiverDetails);
router.post('/getAllChat', AuthUser,getAllChat);

module.exports = router;