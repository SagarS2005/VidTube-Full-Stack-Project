import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subsciption.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const totalVideos = await Video.countDocuments({ owner: userId })

    const videoStats = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: null,
                totalViews: { $sum: "$views" }
            }
        }
    ])

    const totalSubscribers = await Subscription.countDocuments({ channel: userId })

    const totalLikes = await Like.aggregate([
        {
            $lookup: {          // find all the video information
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        { $unwind: "$videoDetails" },       // unwrap video information
        { $match: { "videoDetails.owner": new mongoose.Types.ObjectId(userId) } },      // give current user(owner) data
        { $count: "totalLikes" }    // count total user data as totalLikes 
    ])

    const stats = {
        totalVideos,
        totalViews: videoStats[0]?.totalViews || 0,
        totalSubscribers,
        totalLikes: totalLikes[0]?.totalLikes || 0
    }

    return res
        .status(200)
        .json(new ApiResponse(200, stats, "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const videos = await Video.find({ owner: userId }).sort({ createdAt: -1 })

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

export {
    getChannelStats, 
    getChannelVideos
}