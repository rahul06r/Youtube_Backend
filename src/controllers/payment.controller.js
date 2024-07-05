import { JoinChannel } from "../models/join_channel.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"

import mongoose from "mongoose"

import Stripe from "stripe"



const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const paymentProcess = asyncHandler(async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const { channelID } = req.params;
    const { amount } = req.body;
    // or
    // const { channelID } = req.body;

    try {
        if (!req.user?._id || !mongoose.isValidObjectId(req.user._id)) {
            throw new ApiError(404, "Unauthorized request!!");
        }
        if (!channelID || !mongoose.isValidObjectId(channelID)) {
            throw new ApiError(404, "Invalid Channel ID!!");
        }
        const isJoined = await JoinChannel.findOne(
            { channel: channelID, joinedUserId: req.user._id }
        ).session(session);

        if (isJoined) {
            return res.status(200).json(new ApiResponse(200, {}, "You have already joined the channel"));
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "usd",
            metadata: {
                userId: req.user._id.toString(),
                channelId: channelID
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        if (!paymentIntent) {
            throw new ApiError(500, "Payment Intent not done");
        }
        console.log(`payment intent \n ${JSON.stringify(paymentIntent, null, 2)}`);
        return res.status(200).json(new ApiResponse(200, paymentIntent, "Payment intent done"))

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(`Error in joinChannel: ${error.message}`, { stack: error.stack });
        throw new ApiError(500, "An error occurred while processing your request. Please try again later.");
    }
})


export{
    paymentProcess
}