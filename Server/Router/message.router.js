const express = require('express');
const router = express.Router();
const { newChat, sendMessage } = require('../Controller/sendMessage.controller.js')

router.post('/newChat',newChat);
router.post('/sendMessage',sendMessage);

module.exports = router;