import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Subscription } from "../models/subscriptions.model.js"


// 
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;


    if (!req.user?._id || !isValidObjectId(req.user._id)) {
        throw new ApiError(404, "Unauthorized Request");
    }


    if (!channelId || !isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid or Missing Channel ID");
    }

    try {
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const channelObjectId = new mongoose.Types.ObjectId(channelId);

        const isSubscribed = await Subscription.findOne({
            subscriber: userId,
            channel: channelObjectId
        });

        if (!isSubscribed) {

            const newSubscribe = await Subscription.create({
                subscriber: userId,
                channel: channelObjectId
            });

            return res.status(200).json(new ApiResponse(200, newSubscribe, "Subscribed to Channel Successfully"));
        } else {

            const deleteSubscribe = await Subscription.deleteOne({
                subscriber: userId,
                channel: channelObjectId
            });

            return res.status(200).json(new ApiResponse(200, deleteSubscribe, "Unsubscribed from Channel Successfully"));
        }
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong");
    }
});



// 
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "Unauthorized Request");
        }

        if (!channelId && !isValidObjectId(channelId)) {
            throw new ApiError(400, "No channel id found!!");
        }
        // ! use below code if u need only id of subscribers
        // const allSubscribers = await Subscription.aggregate([
        //     {
        //         $match: {
        //             channel: new mongoose.Types.ObjectId(channelId)
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: null,
        //             subscribers: {
        //                 $push: "$subscriber"
        //             }

        //         }
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             subscribers: 1,
        //         }
        //     }
        // ])
        const allSubscribers = await Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $group: {
                    _id: null,
                    subscriberIds: {
                        $push: "$subscriber"
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "subscriberIds",
                    foreignField: "_id",
                    as: "subscribers",
                    pipeline: [
                        {
                            $project: {
                                coverImage: 0,
                                watchHistory: 0,
                                password: 0,
                                refreshToken: 0

                            }
                        }
                    ]

                }
            },
            {
                $project: {
                    _id: 0,
                    subscribers: 1
                }
            }
        ]);


        if (!allSubscribers || allSubscribers.length == 0) {
            return res.status(200)
                .json(new ApiResponse(200, allSubscribers, `No Subscribers Found ${allSubscribers.length}`))

        }
        return res.status(200)
            .json(new ApiResponse(200, allSubscribers, ` Subscribers Found ${allSubscribers.length}`))
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong##")
    }
});


// 
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    if (!req.user?._id || !isValidObjectId(req.user?._id)) {
        throw new ApiError(404, "Unauthorized Request");
    }

    if (!subscriberId || !isValidObjectId(subscriberId)) {
        throw new ApiError(400, "No channel id found!!");
    }
    const getChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $group: {
                _id: null,
                subscribedId: {
                    $push: "$channel"
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscribedId",
                foreignField: "_id",
                as: "channels",
                pipeline: [
                    {
                        $project: {
                           
                            watchHistory: 0,
                            password: 0,
                            refreshToken: 0

                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 0,
                channels: 1,
            }
        }
    ]);
    if (!getChannels || getChannels.length == 0) {
        return res.status(200)
            .json(new ApiResponse(200, getChannels, `No Subscribers Found ${getChannels.length}`))

    }
    return res.status(200)
        .json(new ApiResponse(200, getChannels, ` Subscribers Found ${getChannels.length}`))

})



export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
}


