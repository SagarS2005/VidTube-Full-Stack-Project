import mongoose, {mongo, Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // It allows to write aggregation queries

const commentSchema = new Schema(
    {
        content:{
            type: String,
            required : true,
        },
        video: {
            type: Schema.Types.ObjectId,
            ref:"Video"
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref:"User"
        }
    },
    { timestamps:true }
)

commentSchema.plugin(mongooseAggregatePaginate)   // Allows aggregation queries

export const Comment = mongoose.model("Comment", commentSchema)