const uploadCloudnary = require("../Services/cloudnary.services.js");
const ApiError = require("../Utils/ApiError.utils");

const uploadImage = async (req, res, next) => {

    try {

        if (!req.file) {
            throw new ApiError(400, "Please select a file");
        }

        const uploadImage = await uploadCloudnary(req.file.path);

        if (!uploadImage) {
            throw new ApiError(500, "Internal error");
        }

        res.success(uploadImage, "File uploaded!", 201);

    } catch (err) {
        next(err);
    }
};

module.exports = {
    uploadImage
}