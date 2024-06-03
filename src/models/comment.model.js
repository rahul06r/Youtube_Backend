import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    commentedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    communityPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommunityPost"
    }
}, { timestamps: true })


commentSchema.plugin(mongooseAggregatePaginate)



export const Comment = mongoose.model("Comment", commentSchema)