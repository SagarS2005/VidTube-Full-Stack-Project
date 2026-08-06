import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Video} from "../models/video.model.js"
import { Comment } from "../models/comment.model.js";

const addComment = asyncHandler( async (req, res) => {
    // user logged in means verifyJWT will used
    const {videoId} = req.params;    // current video for the comment

    const userId = req.user?._id;   //current user id
    const {comment} = req.body

    if(!userId){
        throw new ApiError(401, "User Not Found")
    }

    if (!comment?.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    if (!isValidObjectId(videoId)) {    //returns true (if it is a well-formed ID)
        throw new ApiError(400, "Invalid video ID")
    }
    
    const video = await Video.findById(videoId)   // Step 1: look up the video
    
    if (!video) {                                   // Step 2: check if it exists
        throw new ApiError(404, "Video not found")  //         if not, STOP here
    }

    const addedComment = await Comment.create({
        content: comment,
        video : videoId,
        owner : userId
    })

    return res  
        .status(200)
        .json(new ApiResponse (200, addedComment, "Comment Added"))

    
})

const deleteComment = asyncHandler( async (req, res) => {
   // get user and comment_id
   const userId = req.user?._id;
   const {commentId} = req.params;

   if(!userId){
    throw new ApiError(401, "User Not found")
   }

   if(!isValidObjectId(commentId)){
    throw new ApiError(400, "Invalid CommentId")
   }

   const comment = await Comment.findById(commentId);

   if(!comment) {
    throw new ApiError(404, "Comment not found")
   }

   const video = await Video.findById(comment.video)    // checking whether owner is also want to delete 

   const isCommentOwner = comment.owner.toString() === userId.toString()
   const isVideoOwner = video?.owner.toString() === userId.toString()

    if (!isCommentOwner && !isVideoOwner) { // videoOwner and viewer both can delete comment
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

   await Comment.findByIdAndDelete(commentId);
   
   return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"))
})

const getVideoComments = asyncHandler( async (req, res) => {
    const{videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid CommentId")
    }

    /*
      In an aggregation pipeline, every stage passes along the full document by default, unless you explicitly use $project to limit fields. Since we're aggregating directly on Comment.aggregate([...]), each document flowing through the pipeline already is a full comment — with content, video, owner, timestamps, everything from your schema.
    */

    const comments = await Comment.aggregate([   //it containing all the comment available in db
        {
            $match: { //narrows down to only this video's comments before doing any joins
                video: new mongoose.Types.ObjectId(videoId)
            }   // now commnet has only videdId's comment
        },

        {
            $lookup :{      // here we try to access users(commenters) information for the frontend
                from :"users",
                localField : "owner",
                foreignField:"_id", // owner_id
                as : "owner",
                pipeline :[{
                    $project :{
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }]
            }
        },
        {
            $addFields: {
                owner: {
                    $first : "$owner"
                }
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, comments, "All comment Fetched Successfully")
        )

})

const updateComment = asyncHandler( async (req, res) => {
   const userId = req.user?._id;
   const {commentId} = req.params;
   const {newComment} = req.body

   if(!newComment?.trim()){
    throw new ApiError(404, "Comment not found")
   }

   if(!userId){
    throw new ApiError(401, "User Not found")
   }

   if(!isValidObjectId(commentId)){
    throw new ApiError(400, "Invalid CommentId")
   }

   const comment = await Comment.findById(commentId);

   if(!comment) {
    throw new ApiError(404, "Comment not found")
   }

   if(comment.owner.toString() != userId.toString()){
    throw new ApiError(403, "Unauthorized owner")
   }

   await Comment.findByIdAndUpdate(commentId,
    {
        $set:{
            content : newComment
        }
    },
    {new:true}
);
   
   return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"))
})

export {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment

}