const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

const uploadCloudnary = async (localFilePath) => {
    try {
        if (!localFilePath) {
        } else{
          const response = await cloudinary.uploader.upload(localFilePath , {resource_type: "auto"});
            fs.unlinkSync(localFilePath);
            return response
        }   
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null
    }
}

module.exports = uploadCloudnary;