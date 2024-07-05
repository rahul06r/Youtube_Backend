import mongoose, { Schema } from "mongoose";


const joinChannelSchema = new Schema({
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    joinedUserId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    paymentReference: {
        type: String,
        required: [
            true, "Payment Number is required"
        ]
    }
},
    { timestamps: true, })

joinChannelSchema.index({ paymentReference: "text" })
export const JoinChannel = mongoose.model("JoinChannel", joinChannelSchema) 