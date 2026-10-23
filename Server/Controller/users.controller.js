const {Users, hash, getToken, hashPassword, comparePassword } = require("../Model/user.model.js");
const ApiError = require("../Utils/ApiError.utils.js")

const addUser = async (req , res ,next) => {

    try{
        const {full_name,email,number,password} = req.body;

        const hash  = await hashPassword(password);
    
        const user = await Users.create({
            full_name,email,number,password:hash
        })
    
        if(!user){
            throw new ApiError(500,"User not created");
        }

        const token = getToken(user.id , user.full_name);
    
        res.success(token,"User created",201)
    }catch(err){
        next(err);
    }
};

const loginUser = async (req , res ,next) => {

    try{
        const {email,number,password} = req.body;
    
        const user = await Users.findOne({
            where:{
                email,
                number
            }
        })

        if(!user){
            throw new ApiError(404,"User not found")
        }
        
        const passwordTrue = await comparePassword(password,user.password);

        const token = getToken(user.id , user.full_name);

        if(passwordTrue){
            res.success(token,"User logged",200);
        }else{
            throw new ApiError(404,"Password is incorrect")
        }
    
    }catch(err){
        next(err);
    }
};

module.exports = {
    addUser,
    loginUser
}