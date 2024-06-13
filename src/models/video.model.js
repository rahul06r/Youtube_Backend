import mongoose, { Schema } from "mongoose";


import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";



const videoSchmea = new Schema(
    {
        videoFile: {
            type: String, //cloudnary URl
            required: true
        },
        thumbnail: {
            type: String, //cloudnary URl
            required: true

        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            deafult: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }


    },
    { timestamps: true, })


videoSchmea.index({ title: "text" });

videoSchmea.plugin(mongooseAggregatePaginate)




export const Video = mongoose.model("Video", videoSchmea)