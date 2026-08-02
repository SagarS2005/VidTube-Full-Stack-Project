import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber : {
            type : Schema.Types.ObjectId,   // one who is subscribing
            ref : "User"
        },
        channel : {
            type : Schema.Types.ObjectId,   // main user channel
            ref : "User"
        },
        isSubscribed :{
            type : Boolean,
            true : true
        },        
    }, {timestamps:true}
)


export const Subscription = mongoose.model("Subscription", subscriptionSchema)