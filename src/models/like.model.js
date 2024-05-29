import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const likeSchema = new Schema({
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    likedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    communityPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommunityPost"
    }
}, { timestamps: true })

likeSchema.plugin(mongooseAggregatePaginate)


export const Like = mongoose.model("Like", likeSchema)