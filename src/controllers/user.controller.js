import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async(userId) =>{
    try{
        const user =await User.findById(userId)
        const accessToken =user.generateAccessToken () // Coming from userModel
        const refreshToken=user.generateRefreshToken ()

        user.refreshToken = refreshToken    // refresh token updated
        await user.save({validateBeforeSave : false}) // save method is come from mongoDB since user is mongoDB object
        
        return {accessToken, refreshToken}
    }
    catch(error){
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Tokens")
    }
}

const registerUser = asyncHandler( async (req,res) =>{
    /*
    res.status(200).json({  // code is a http code for user conventional
        message : "Registration Successfull"
    })
    */
   
   // get user details from frontend

            console.log("BODY:", req.body); // it contains api's passed data (username, email, coverImage etc)
            console.log("FILES:", req.files);   // it will come from multer that contains file's(photos) data
    
    const {fullName, email, username, password} = req.body  // body is used from form data (Api Requst)
    console.log("email : ", email);     // check it using Postman by sending post request
    
    // checking required field not empty
    if (
        [fullName, email, username, password].some( (field)=> field?.trim() ==="")  // array.some() simple js
    ){
        throw new ApiError(400, "All fields are required")
    }

    // Validation of data (eg : email contains "@")
    // if(email.)

    // Check whether user already exist
    const existedUser = await User.findOne({    // finds username || email
        $or: [{username }, { email}]
    })
    
    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    // check files(avatar, coverImages) path
    const avatarLocalPath =req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath, "VidTube/avatars")     // filepath , folder-path
    const coverImage = await uploadOnCloudinary(coverImageLocalPath, "VidTube/cover-images")
    if (!avatar){
        throw new ApiError(400, "Avatar file is required")
    }


    // creating user object - create entry in db
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage :coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )   // by defualt all field are selected, selected method used to unselect & "-ve" sign indicate not require
    // it returns user object without "password & refreshToken " field

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registring user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered SuccessFully") 
    )

})  // Register User code comple

                // Login User code
const loginUser = asyncHandler(async (req,res) => {
    // req body for data 
    const {email ,username , password} = req.body
    if(!email && !username){
        throw new ApiError(404, "username or email is required");
    }

    // .findOne (object) : it accept object only so we can't pass string directly into it
    const user = await User.findOne({ // User is mongoDB User
        $or : [{email}, {username}]
    })  // it return object (User with empty refresh tokend)if email or username will be found 
    
    if(!user){
        throw new ApiError(404, "User doesn't exist")
    }

    // Password check
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Incorrect Password")
    }

    // set refresh and access tokens
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)
    /* here refresh token has been updated by generateAccessAndRefreshTokens but the user(reference) got earlier has a "empty" refresh tokens becuase on that time tokens was not created*/

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")    // remove password and refreshToken from resulted object
    // 	Profile data for frontend to display (name, avatar, etc.) — not includes sensitive data like password and refresh tokens

    const options = {   // for the cookies
        httpOnly : true,
        secure : true
    } 
    
    // send cookies
    return res.status(200)
    .cookie("accessToken",accessToken, options) // key : value
    .cookie("refreshToken",refreshToken,options)        // .cookie is used to set cookie for browser while. json is used to passed data for mobile user
    .json(        // this is used for mobile app, becuase mobile app don't handle cookies the same automatic way browsers do; many mobile HTTP clients need to manually grab the token from the JSON response and store it themselves
        new ApiResponse(
            200,    // status code 
            {
                user:loggedInUser, accessToken,
                refreshToken
            },      // data {key : value pair}
            "User logged In Successfully"   // message
        ) 
    )
})  // login code complete
        
        // LogOut User
const logOutUser = asyncHandler( async (req, res) =>{       // here request will be pass by middleware mentioned in router
    // STEPS :- have to remove accessToken and refresh token from cookies and also remove refresh token from database
        await User.findByIdAndUpdate(req.user._id,
            {
                $unset:{
                    refreshToken:1 // removing refresh token from MongoDB since user want's to logOut
                }
            },
            {
                new:true
            }
        
        ) // req.user is come from verifyJWT

        const options = {   // for the cookies
        httpOnly : true,
        secure : true
        } 

        return res
        .status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User Logged Out Successfully"))
    })

        // Api End Point hit (means refreshing access token when it expired)
const refresAccessToken = asyncHandler( async (req, res) =>{
    const incomingRefreshToken = await req.cookies?.refreshToken || req.body.refreshToken // req.body means data from json for mobile user or PostMan request

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used")
        }
    
        // since accessToken time expired means genereting new tokens
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options )
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, newRefreshToken},
                "Access Token Refreshed"
            )
        )
    } 
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }   

})

const changeCurrentPassword = asyncHandler ( async (req,res) => {
    const {oldPassword, newPassword} = req.body

    /* to change password user must be logged In, and if user is logged in means verifyJWt(auth) middleware have added user object (req.user = user) in their cookies*/

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid Old password")
    }
    
    user.password = newPassword

    await user.save({validateBeforeSave : false})

    return res
    .status(200)
    .json( new ApiResponse(200, {}, "Password change successfully"))


})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if (!fullName ||  !email) {
        throw new ApiError(400, "All fields are required")
    }

        // Ignore the currently logged-in User while checking for duplicate emails.    const existingStudent = 
    const existingUser = await User.findOne(
            {
                email: normalizedEmail,
                _id: {$ne: req.user._id}    // ne : not equal
            }
        );

    if (existingUser) {
        throw new ApiError(409,"Another User already uses this email");
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email        //(we can set by giving only by key value or can use user key : pair both)
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});


//(we can set by giving only by key value or can use user key : pair both)

const updateUserAvatar = asyncHandler ( async (req, res) => {
    // Check user logged in by auth middleware
    // Add multer at updateUserAvatar route which takes new Avatar and update in cloudynary
    // update and save user

    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")
    }
    
    // Delete old image 
    // const data = await User.findById(req.user._id)
    // if (!data) {
    //     throw new apiError(
    //         404,
    //         "User not found"
    //     );
    // }
    // if (data.avatar?.publicId) {
    //     console.log("Avatar public id: ",data.avatar?.publicId)
    //     await deleteFromCloudinary(
    //         data.avatar.publicId,
    //         "image"
    //     );
    // }  not completed, deleteFromCloudinary is not created yet
    // console.log("Removed successfully from cloudinary")
    
    const avatar = await uploadOnCloudinary(avatarLocalPath, "VidTube/avatars")    // it gives updated avatar link
    // console.log(avatar)
    if(!avatar?.url){
        throw new ApiError (400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar :avatar.url
            }
        },
        {returnDocument: "after"}
    ).select("-password")

    return res
    .status(200)
    .json( new ApiResponse(200, user, "Avatar updated SuccssFully"))
})


const updateCoverImage = asyncHandler ( async (req, res) => {
    // Check user logged in by auth middleware
    // Add multer at updateUserAvatar route which takes new Avatar and update in cloudynary
    // update and save user

    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400, "CoverImage file is missing")
    }

    // deleting old coverImage
    // const data = await User.findById(req.user._id)
    // if (!data) {
    //     throw new ApiError(
    //         404,
    //         "User not found"
    //     );
    // }
    // if (data.coverImage?.publicId) {
    //     await deleteFromCloudinary(
    //         data.coverImage.publicId,
    //         "image"
    //     );
    // }     not completed yet


    const coverImage = await uploadOnCloudinary(coverImageLocalPath, "VidTube/cover-images")    // it gives updated avatar link

    if(!coverImage.url){
        throw new ApiError (400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage :coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "CoverImage updated SuccssFully")
    )
})


const getUserChannelProfile = asyncHandler ( async (req, res) => {
   const {username} = req.param

   if(!username?.trim()) {
    throw new ApiError(400, "username is missing")
   }

   // Aggregation pipeline mostly return arrays result
   const channel = await User.aggregate([
        {   // stage 1 match 
            $match: {
                username : username?.toLowerCase()
            }
        },
        {
            $lookup :{  // lookup gives matching resut as arrays
                from :"subscriptions",
                localField: "_id",
                foreignField:"channel",
                as: "subscribers"
            }
        },
        {
            $lookup :{
                from :"subscriptions",
                localField: "_id",
                foreignField:"subscribe",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subcribersCount:{
                    $size :"$subscribers"
                },
                channelsSubscribedToCount :{
                    $size :"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if :{$in: [req.user?._id, "$subsribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{      // select value to project
                fullName:1, 
                username:1, // flag 1 indicate this value to show
                subcribersCount:1,
                channelsSubscribedToCount:1,
                avatar:1,
                coverImage:1,
                email :1
            }
        }

   ])

   if(!channel?.length){
    throw new ApiError(404, "channel doestn't exist")
   }

   return res
   .status(200)
   .json( 
        new ApiResponse(200, channel[0], "user Channel Fetched Successfully")
    )
})


const getWatchHistory = asyncHandler (async (req, res) => {
    const user = await User.aggregate([
        {
            $match :{
                _id: new mongoose.Types.ObjectId(req.user._id),
                /*since req.user._id gives us string and the mongoose conver it into mongoDB id internally, but when we use aggregation pipelines then all mongoose requires that  to change it explicitely on objectype */
            }
        },
        {
           $lookup :{
            from: "videos",
            localField: "watchHistory", // in which field we want to save data
            foreignField :"_id",    // from which field data will come
            as : "watchHistory",    //  all data comes from videos db field will be stored in watchHistory
            pipeline:[  // used to get only needed data
                {
                    $lookup:{
                        from : "users", // db objects automatically converted in plural form
                        localField :"owner",    // db objects automatically converted in plural form     
                        foreignField:"_id", // it gives owner of video
                        as : "owner",      // alias name
                        pipeline :[{    // all data will store in owner field (after that it will store in watchHistory)
                            $project :{ // only this field will show on owner
                                fullName:1,
                                username:1,
                                avatar:1
                            }
                        }]
                    }
                },
                {
                    $addFields :{
                        owner:{
                            $first :"$owner"
                        }
                    }
                }
            ]
           } 
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "Watch History Fetched Successfully")
    )
})

export {
    registerUser,
    loginUser,
    logOutUser,
    refresAccessToken, 
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateCoverImage,
    updateUserAvatar,
    getUserChannelProfile,
    getWatchHistory
}