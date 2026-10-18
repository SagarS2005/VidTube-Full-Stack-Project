/* This middleware is used for find id of user using access token . Since user has logged in means they definately have access token and using this access token we can find user id and then pass this user id to the loggedOutUser(by next()) by attaching it into req parameter using req.user = user
*/
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler( async (req, res, next) =>{
    try {
        const authHeader = req.header("Authorization");
        const token = req.cookies?.accessToken || (authHeader ? authHeader.replace(/^Bearer\s+/i, "").trim() : null);
        // cookies is middleware declare in app.js (app.use(cookie-parser()))
    
        if (!token){
            throw new ApiError(401, "Unauthorized Request")
        }
    
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        
        const user= await User.findById(decodeToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user;
        next()  // call next function(or middleware), now control will go to the logOutUser controller
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})

export const optionalVerifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        const token = req.cookies?.accessToken || (authHeader ? authHeader.replace(/^Bearer\s+/i, "").trim() : null);

        if (!token) {
            req.user = null;
            return next();
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken");
        req.user = user || null;
        next();
    } catch {
        req.user = null;
        next();
    }
});