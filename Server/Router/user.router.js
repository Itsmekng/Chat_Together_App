const express = require('express');
const router = express.Router();
const { addUser, loginUser } = require('../Controller/users.controller');

router.post("/addUser",addUser);
router.post("/loginUser",loginUser);

module.exports = router;