import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asynchandler.js";


import { ApiError } from "../utils/ApiError.js"

import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";







const getChannelVideos = asyncHandler(async (req, res) => {
    // const {userId}=req.params;
    const userID = req.user?._id;

    if (!userID) {
        throw new ApiError(404, "Unauthorized request");
    }

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
                email:1,
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

})


export {
    getChannelVideos
}

// get userId from jwt
// from user model _id right join video model owner 