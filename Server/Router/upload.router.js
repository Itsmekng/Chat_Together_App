const express = require('express');
const { uploadImage } = require('../Controller/upload.controller');
const upload = require('../Middleware/multer.middleware');
const AuthUser = require('../Middleware/auth.middleware');
const router = express.Router();

router.post("/upload-image", AuthUser, upload.single('chatImage'), uploadImage);
module.exports = router