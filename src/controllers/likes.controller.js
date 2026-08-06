import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"

const getLikedVideos = asyncHandler ( async (req, res) =>{
    const userId = req.user?._id;

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid UserId")
    }

    const videos = await Like.aggregate([
        {
            $match:{
                likedBy : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "videos",
                pipeline :[
                    {
                        $project:{
                            videoFile:1,
                            thumbnail:1,
                            title:1,
                            owner:1                            
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likedVideos : { $first :"$videos"}
            }
        }
    ]
        
    )

    if(!videos){
        throw new Error(500, "Something went wrond");
    }

    return res  
        .status(200)
        .json(new ApiResponse(200, videos, "Liked videos fetched successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const existCommentLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    if (existCommentLike) {
        await Like.findByIdAndDelete(existCommentLike._id)

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment like removed successfully"))
    }

    const newCommentLike = await Like.create({
        comment: commentId,
        likedBy: userId
    })

    return res
        .status(200)
        .json(new ApiResponse(200, newCommentLike, "Comment liked successfully"))
})

const toggleVideoLike = asyncHandler ( async (req, res) =>{
    const { videoId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const existVideoLike = await Like.findOne({
        video : videoId,
        likedBy: userId
    })

    if (existVideoLike) {
        await Like.findByIdAndDelete(existVideoLike._id)

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Video like removed successfully"))
    }

    const newVideoLike = await Like.create({
        video : videoId,
        likedBy: userId
    })

    return res
        .status(200)
        .json(new ApiResponse(200, newVideoLike, "Video liked successfully"))
})


export{
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike
}
