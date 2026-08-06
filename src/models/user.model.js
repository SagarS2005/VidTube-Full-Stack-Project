import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username : {
            type : String ,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true,
        },
        email : {
            type : String ,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            
        },
        fullName : {
            type : String ,
            required : true,
            index : true,
            trim : true,
        },
        avatar: {
            type : String , // cloudinary ulr
            required : true,   
        },
        coverImage:{
            type : String,
        },
        watchHistory :[
            {
                type :  Schema.Types.ObjectId,
                ref : "Video",  // take it from "Video" model as it is
            }
        ],
        password : {
            type : String,
            required : [true,"Password is required"]
        },
        refreshToken : {
            type : String
        }

    },
    {
        timestamps:true
    }
)


// userSchema.pre("save", async function (next) {
    //     if(!this.isModified("password")) return next();
    
    //     this.password = await bcrypt.hash(this.password,10) // bcrypt.hash(value, round)
    //     next(); // next is coming from API Handler 
    // })
    
    
    // pre is middleware and 'save' is middleware hooks
userSchema.pre("save", async function () {  // automatically invoke, for .create(), & .save()
    if(!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
})

// userSchema.method => it is (.method) special object that allows you to create userdefine method
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password,this.password)
} 

userSchema.methods.generateAccessToken = function(){     
    return jwt.sign(
        {
            _id: this._id,
            email : this.email,
            username : this.username,
            fullName :this.fullName 
            /*This all data(payload) will be attach in your genrated token, so take it minimal becuase if user change their email, password, or userName then new token generated and mismatch ocuur, that required login */
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id, 
            /*This all data(payload) will be attach in your genrated token, so take it minimal becuase if user change their email, password, or userName then new token generated and mismatch ocuur, that required login  
            try to keep only _id in it*/
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User",userSchema)