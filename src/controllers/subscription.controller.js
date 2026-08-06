import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Subscription } from "../models/subsciption.model.js"



const getSubscribedChannels = asyncHandler(async (req, res) => {    // channel that i subscribed
    const userId = req.user?._id   // logged-in user, not from params

    const channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId)  // find all subscription docs where I am the subscriber
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannels",
                pipeline: [
                    { $project: { fullName: 1, username: 1, avatar: 1 } }
                ]
            }
        },
        {
            $addFields: {
                subscribedChannels: { $first: "$subscribedChannels" }
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"))
})

const getChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId) 
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [
                    { $project: { fullName: 1, username: 1, avatar: 1 } }
                ]
            }
        },
        {
            $addFields: {
                subscriberDetails: { $first: "$subscriberDetails" }
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
})

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberId = req.user?._id

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    if (channelId.toString() === subscriberId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Unsubscribed successfully"))
    }

    const newSubscription = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    })

    return res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "Subscribed successfully"))
})

export{
    getSubscribedChannels,
    getChannelSubscribers,
    toggleSubscription,
}