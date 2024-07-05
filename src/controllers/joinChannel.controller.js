import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"

import mongoose from "mongoose"

import { JoinChannel } from "../models/join_channel.model.js"
import Stripe from "stripe"
import { PaymentDetail } from "../models/payment.model.js"



const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const joinChannel = asyncHandler(async (req, res) => {
    const { channelID, paymentIntentID } = req.params;
    const { amount } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

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
        const verificationPaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentID);


        console.log(`Verification payment intent status:\n${JSON.stringify(verificationPaymentIntent, null, 2)}`);
        // ! once you coonect to front end uncomment the below code,because verification with client secret key is done in frontend !
        // if (verificationPaymentIntent.status !== 'success') {
        //     throw new ApiError(400, `Payment not successful. Status: ${verificationPaymentIntent.status}`);
        // }
        if (verificationPaymentIntent.status === 'success') {
            throw new ApiError(400, `Payment not successful. Status: ${verificationPaymentIntent.status}`);
        }

        const paymentDone = await PaymentDetail.create(
            [
                {
                    user: req.user._id,
                    amount,
                    channel: channelID,
                    paymentIntentId: paymentIntentID,
                    activeStatus: true,
                    // expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)  // Expiry 30 days //! but for now it is not imlemented
                }
            ],
            { session: session }
        );

        if (!paymentDone) {
            throw new ApiError(400, "Payment creation failed");
        }

        const join = await JoinChannel.create(
            [
                {
                    channel: channelID,
                    joinedUserId: req.user._id,
                    paymentReference: paymentIntentID,
                }
            ],
            { session: session }
        );

        if (!join) {
            throw new ApiError(404, "Failed to join channel");
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json(new ApiResponse(200, join, "You have successfully joined the channel"));

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(`Error in joinChannel: ${error.message}`, { stack: error.stack });
        throw new ApiError(500, "An error occurred while processing your request. Please try again later.");
    }
});




export {
    joinChannel
}
