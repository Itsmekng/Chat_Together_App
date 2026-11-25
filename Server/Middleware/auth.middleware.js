const { verifyToken } = require("../Model/user.model");

const AuthUser = async ( req , res , next) => {
    try{
        const token = req.get('authToken');
        const userDetails = verifyToken(token);
        req.userDetails = userDetails;
        next();
    }catch(err){
        console.log(err);
    }
}

module.exports = AuthUser;