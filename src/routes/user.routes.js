import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logOutUser, refresAccessToken, registerUser, updateAccountDetails, updateCoverImage, updateUserAvatar } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT, optionalVerifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

const router = Router() ;

//router.route("/register").post(middleware, register)          // middleware upload.fields()

router.route("/register").post(
    upload.fields([     // firslty run middleware
        {
            name: "avatar",
            maxCount:1
        },
        {
            name : "coverImage",
            maxCount:1
        }
    ] // upload.fields is middleware, here it is used for multer
    ),
    registerUser
)   // .upload is come from multer middleware.

// router.route("/login").post(login)
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post( verifyJWT, logOutUser)
router.route("/refresh-token").post(refresAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)
// patch is used when we want to update record
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)

// param 
router.route("/channel/:username").get(optionalVerifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router


/*
 When user send data to the backend the use post method
 eg: login details, logoutdetails(user must be login)

 When user want to get data like watchHistory, channelProfile

 patch : allows an application to update specific fields in a document without overwriting the rest of the existing data
*/