const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Group = require('../models/group');
const auth = async (req, res, next) => {
    try {
       const token=req.cookies.token;
       if(!token)
        {return(
           res.status(404).json({
               success:false,
               message:"login first",
           }))
        }
        const decoded=jwt.verify(token,"pqowieuryt");
        req.user=await User.findOne({_id:decoded._id});
        // req.user=await User.findById({_id:decode._id});
        next();
    }
    catch (error) {
        res.status(404).json({
            success:false,
            message:"login first",
        })
    }
}
module.exports = auth;  
