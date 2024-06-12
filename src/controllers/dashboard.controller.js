import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asynchandler.js";


import { ApiError } from "../utils/ApiError.js"

import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";



const getChannelStats = asyncHandler(async (req, res) => {
    // ToDO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    if (!req.user?._id && !isValidObjectId(req.user?._id)) {
        throw new ApiError(404, "Unauthorized request");
    }
    try {
        const allStats = await Video.aggregate([
            {
                $match: {
                    owner: new mongoose.Types.ObjectId(req.user?._id),
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "owner",
                    foreignField: "channel",
                    as: "subscribersCount"
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "likesCount"
                }
            },
            {
                $addFields: {
                    likesCount: { $size: "$likesCount" }
                }
            },
            {
                $group: {
                    _id: null,
                    totalLikes: { $sum: "$likesCount" },
                    totalVideos: { $sum: 1 },
                    TotalSubscribers: { $first: { $size: "$subscribersCount" } },
                    videos: {
                        $push: {
                            _id: "$_id",
                            title: "$title",
                            description: "$description",
                            owner: "$owner",
                            createdAt: "$createdAt",
                            updatedAt: "$updatedAt",
                            videoFile: "$videoFile",
                            thumbnail: "$thumbnail",
                            likesCount: "$likesCount",
                            views: "$views",
                            isPublished: "$isPublished",

                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalLikes: 1,
                    totalVideos: 1,
                    TotalSubscribers: 1,
                    videos: 1
                }
            }
        ]);
        if (!allStats || allStats.length == 0) {
            return res.status(200)
                .json(new ApiResponse(200, {}, `No videos posted ,so no stats available`))
        }



        return res.status(200)
            .json(new ApiResponse(200, allStats, `Fetched Successfully ${allStats.length}`))
    } catch (error) {
        throw new ApiError(500, error.message || "Sommenthing went wrong!!")

    }
})



const getChannelVideos = asyncHandler(async (req, res) => {

    const userID = req.user?._id;

    if (!userID && !isValidObjectId(userID)) {
        throw new ApiError(404, "Unauthorized request");
    }

    try {
        const allChannelVideos = await User.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userID)
                }
            }, {
                $lookup: {
                    from: "videos",
                    localField: "_id",
                    foreignField: "owner",
                    as: "allVideos"
                }
            },
            {
                $addFields: {
                    allVideos: "$allVideos"
                }
            },
            {
                $project: {
                    username: 1,
                    fullName: 1,
                    email: 1,
                    avatar: 1,
                    coverImage: 1,
                    allVideos: 1,
                    createdAt: 1,
                    updatedAt: 1,


                }
            }

        ])

        if (!allChannelVideos.length) {
            throw new ApiError(400, "No Videos found!!!")
        }
        return res.status(200)
            .json(
                new ApiResponse(200, allChannelVideos, `Channel videos fetched successfully ${allChannelVideos.length}`)
            )
    } catch (error) {
        throw new ApiError(500, error.message || "Sommenthing went wrong!!")
    }

})


export {
    getChannelVideos,
    getChannelStats
}

// get userId from jwt
// from user model _id right join video model owner 