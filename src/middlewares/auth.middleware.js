/* This middleware is used for find id of user using access token . Since user has logged in means they definately have access token and using this access token we can find user id and then pass this user id to the loggedOutUser(by next()) by attaching it into req parameter using req.user = user
*/
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler( async (req, res, next) =>{
    try {
        // we can access , refresh token and access tokens both but refresh tokes stored in db that's why it is costly, therefore we use access token for cheap rate
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer","")    // since User is already login means they have token in their cookies
        // cookies is middleware declare in app.js (app.use(cookie-parser()))
    
        if (!token){
            throw new ApiError(404, "Unauthorized Request")
        }
    
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        
        const user= await User.findById(decodeToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user;
        next()  // call next function(or middleware), now control will go to the logOutUser controller
    } catch (error) {
        throw new ApiError(401, error?.message || "Invlaid Access Token")
    }
})