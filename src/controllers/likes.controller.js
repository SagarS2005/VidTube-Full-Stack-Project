import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"

const getLikedVideos = asyncHandler ( async (req, res) =>{
    const userId = req.user?._id;

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid UserId")
    }

    const videos = await Like.aggregate([
        {
            $match:{
                likedBy : new mongoose.Types.ObjectId(userId),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup:{
                from : "videos",
                localField : "video",
                foreignField : "_id",
                as : "video",
                pipeline :[
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            ownerDetails: { $first: "$ownerDetails" }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$video"
        },
        {
            $replaceRoot: {
                newRoot: "$video"
            }
        }
    ])

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

        const likesCount = await Like.countDocuments({ comment: commentId });
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false, likesCount }, "Comment like removed successfully"))
    }

    const newCommentLike = await Like.create({
        comment: commentId,
        likedBy: userId
    })

    const likesCount = await Like.countDocuments({ comment: commentId });
    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true, likesCount }, "Comment liked successfully"))
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

        const likesCount = await Like.countDocuments({ video: videoId });
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false, likesCount }, "Video like removed successfully"))
    }

    await Like.create({
        video : videoId,
        likedBy: userId
    })

    const likesCount = await Like.countDocuments({ video: videoId });
    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true, likesCount }, "Video liked successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const existTweetLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    if (existTweetLike) {
        await Like.findByIdAndDelete(existTweetLike._id)

        const likesCount = await Like.countDocuments({ tweet: tweetId });
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false, likesCount }, "Tweet like removed successfully"))
    }

    await Like.create({
        tweet: tweetId,
        likedBy: userId
    })

    const likesCount = await Like.countDocuments({ tweet: tweetId });
    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true, likesCount }, "Tweet liked successfully"))
})

export{
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike
}
