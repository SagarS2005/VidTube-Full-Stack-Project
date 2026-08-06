import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

    // take reference from getUserProfile from user controller
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const pipeline=[]

    // 1. Search by title/description if a query string is provided
    if(query){
        pipeline.push({
            $match :{
                $or :[
                    {title : {$regex : query, $option :"i" } },
                    {description: { $regex : query, $option : "i"}}
                ]
            }
        })
    }

    // 2. Filter by a specific user's videos, if userId is provided
    if(userId){
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid UserId")
        }

        pipeline.push({
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
                /*userId is string coming from param(req) , .ObjectId(userId) convert it into objectId Type */
            }
        })
    }

    // 3. Only show published videos to the public
    pipeline.push({ $match: { isPublished: true } })

    // 4. Sorting
    if(sortBy && sortType){
        pipeline.push({
            $sort :{
                [sortBy]:sortType === "asc" ? 1 : -1
            }
        })
    }
    else{
        pipeline.push({ $sort :{createdAt : -1}})   // default : newest first
    }   

    
    //  5. Join owner details (so frontend gets uploader info, not just an ID)
    pipeline.push(
        {
            $lookup :{
                from : "users" , // user model will be plural on database
                localField : "owner",
                foreignField : "_id",
                as : "ownerDetails",
                pipeline:[
                    {
                        $project :{
                            username:1,
                            fullName:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                ownerDetails :  {$first : "$onwerDetails"}   
            }
        }
    )

    const videoAggregate = Video.aggregate(pipeline)

    const options = {
        page : parseInt(page, 10),
        limit : parseInt(limit, 10)
    }
    const videos = await Video.aggregatePaginate(videoAggregate, options)

    /* 
    .aggregatePaginate :  this plugin takes your aggregation pipeline (unexecuted) and handles skip/limit/total count/page metadata for you, so you don't have to manually calculate skip = (page - 1) * limit. 
    */
    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos Fetched Successfully" ))
})

const publishAVideo = asyncHandler(async (req, res) => { // user must be loggedIn means use middleware veriryJWT is used 
    let { title, description} = req.body
     // console.log(req.body)
    // console.log(req.files)

    title = title?.trim()   // we can use trim function directly in Video Model
    description = description?.trim()

    if (!title || !description) {
        throw new ApiError(400, "Title and description are required")
    }

    // TODO: get video, upload to cloudinary, create video
    const videoPath = req.files?.videoFile?.[0]?.path;          // console.log(videoPath)
    const thumbnailPath = req.files?.thumbnail?.[0]?.path;
    
    const videoFile = await uploadOnCloudinary(videoPath, "VidTube/videos")     // filepath, folderPath for cloudinary
    const thumbnail = await uploadOnCloudinary(thumbnailPath, "VidTube/thumbnails") // filepath, location

    if(!videoFile || !thumbnail){
        throw new ApiError(400,"video and thumbnail both are required")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(201, video, "Video Uploaded Successfully")
    )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params  // when user click any video or thumbnail the video id will be added in param
    // videoId is extracting from the video route
    
    if (!isValidObjectId(videoId)) {    //returns true (if it is a well-formed ID)
        throw new ApiError(400, "Invalid video ID")
    }
    
    //TODO: get video by id
    const video = await Video.findById(videoId) // it will take the link of video from DB

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

        // Update watch history only if the user is logged in
    if (req.user) {
        await User.findByIdAndUpdate(
            req.user._id,
            {
                // Remove the video if it is already present
                $pull: {
                    watchHistory: video._id
                }
            }
        );

        // Add the video again as the most recently watched video
        await User.findByIdAndUpdate(
            req.user._id,
            {
                $push: {
                    watchHistory: video._id
                }
            }
        );
    }

    return res
    .status(200)
    .json(new ApiResponse(201, video, "Video Fetched Successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description} = req.body
    const thumbnailLocalPath = req.files?.path
    //TODO: update video details like title, description, thumbnail

    if (!isValidObjectId(videoId)) {    //returns true (if it is a well-formed ID)
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)   // Step 1: look up the video

    if (!video) {                                   // Step 2: check if it exists
        throw new ApiError(404, "Video not found")  //         if not, STOP here
    }
    

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Not authorized")
    }

    if(thumbnailLocalPath){
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "VidTube/thumbanails")
        if(!thumbnail?.url){
            throw new ApiError(400, "Error uploading thumbnail")
        }
    }
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail:thumbnail?.url
            }
        },
        {new:true}

    ) 
    if(!updateVideo){
        throw new ApiError(403, "Video Not Found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200), updateVideo, "Successfully Updated")


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {    //returns true (if it is a well-formed ID)
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"))

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
  
    if (!isValidObjectId(videoId)) {    //returns true (if it is a well-formed ID)
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(401, "Video not found")
    }

    if(video.owner._id.toString() != req.user._id.toString()){
        throw new ApiError(403, "Unauthorized User")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
        .status(200)
        .json(new ApiResponse(200, video, `Video ${video.isPublished ? "published" : "unpublished"} successfully`))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}