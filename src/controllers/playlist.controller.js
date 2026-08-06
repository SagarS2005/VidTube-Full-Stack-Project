import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { PlayList } from "../models/playlist.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    let { name, description } = req.body

    if (!userId) {
        throw new ApiError(401, "Unauthorized request")
    }

    name = name?.trim()
    description = description?.trim()

    if (!name) {
        throw new ApiError(400, "Playlist name is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: userId
    })

    if (!playlist) {
        throw new ApiError(500, "Failed to create playlist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist created successfully"))
})

const getPlaylistById = asyncHandler (async (req, res) =>{
    const {playlistId} = req.params;
    const userId = req.user._id;
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id")
    }
    
    if (!userId) {
        throw new ApiError(401, "Unauthorized request")
    }   

    
    const playlList = await PlayList.findById(playlistId);

    if(!playlList){
        throw new ApiError(404, "PlayList Not Found")
    }

    if(userId.toString() != playlList.owner.toString()){
        throw new ApiError(401, "Unauthorized request")
    }

    
    return res
        .status(200)
        .json(200, playlList, "Playlist Fetched Successfully")
})

const deletePlaylist = asyncHandler (async (req, res) =>{
    const {playlistId} = req.params;
    const userId = req.user._id;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist Id")
    }

    if(!userId){
        throw new ApiError(401, "Unauthorized Access")
    }

    const playlList = await PlayList.findById(playlistId);

    if(!playlList){
        throw new ApiError(404, "PlayList Not Found")
    }

    if(playlList.owner.toString() != userId.toString()){
        throw new ApiError(403, "Unauthorized request")

    }

    await PlayList.findByIdAndDelete(playlistId)
    return res
        .status(200)
        .json(200, {}, "Playlist Removed Successfully")
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const userId = req.user?._id
    let { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID")
    }

    if (!userId) {
        throw new ApiError(401, "Unauthorized access")
    }

    name = name?.trim()
    description = description?.trim()

    if (!name) {
        throw new ApiError(400, "Playlist name is required")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: { name, description }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const playlists = await Playlist.find({ owner: userId })

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "Playlists fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId }
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler (async (req, res) =>{
    const { playlistId, videoId } = req.params
    const userId = req.user?._id

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlist or video ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    if (playlist.owner.toString() !== userId.toString()) {
        throw new ApiError(403, "Unauthorized request")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }      // pull removes only matching id's video
        },
        { new: true }
    )

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"))
})



export{
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist
}
