import mongoose, { Schema } from "mongoose";


const paymentSchmea = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    amount: {
        type: Number,
        required: true,
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    paymentIntentId: {
        type: Object,
        required: true,
    },
    activeStatus: {
        type: Boolean,
        required: true,
        default: false,
    }
},
    { timestamps: true, })


export const PaymentDetail = mongoose.model("PaymentDetail", paymentSchmea)