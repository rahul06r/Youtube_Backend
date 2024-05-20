import mongoose, { Schema } from "mongoose";



const subscriptionSchema = new Schema({
    // subscriber nothing but which ur subscribed
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    // channel is nothing but channel subscribers 
    channel:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })



export const Subscription = mongoose.model("Subscription", subscriptionSchema)