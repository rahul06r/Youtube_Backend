import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { Like } from "../models/like.model.js";
import { User } from "../models/user.model.js";


// 
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    try {
        if (!videoId && !isValidObjectId(videoId)) {
            throw new ApiError(400, "video id required!!")

        }

        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "Unauthorized Request!!")
        }
        const conditionForLike = { likedBy: req.user?._id, video: videoId }

        const isLiked = await Like.findOne(conditionForLike);

        if (!isLiked) {
            const createLike = await Like.create(conditionForLike)
            console.log("CreateLike", createLike);
            return res.status(200)
                .json(new ApiResponse(200, createLike, "Video Liked Successfully"))

        }
        else {
            const disLike = await Like.findOneAndDelete(isLiked._id);

            return res.status(200)
                .json(new ApiResponse(200, disLike, "Video Unliked  Successfully"))
        }


    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!")
    }

})

// 
const toggleCommunityPostLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    try {
        if (!postId && !isValidObjectId(postId)) {
            throw new ApiError(400, "Post id required!!")

        }

        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "Unauthorized Request!!")
        }
        // 
        const conditionForLike = { likedBy: req.user?._id, communityPost: postId };
        const isPostLiked = await Like.findOne(conditionForLike);
        if (!isPostLiked) {
            const postLiked = await Like.create(conditionForLike)

            return res.status(200)
                .json(new ApiResponse(200, postLiked, "Post Liked Successfully"))
        }
        else {
            const disLiked = await Like.findOneAndDelete(conditionForLike);
            return res.status(200)
                .json(new ApiResponse(200, disLiked, "Post disliked Successfully"))
        }

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!")
    }
})
// 


const getAllLikedVideos = asyncHandler(async (req, res) => {
    const { userId } = req.user?._id;
    try {
        if (!userId && !isValidObjectId(req.user?._id)) {
            throw new ApiError(400, "Unauthorized Request!!");
        }
        // ##more optimized
        const allLikedVideos = await Like.aggregate([
            {
                $match: {
                    likedBy: req.user?._id,
                    video: {
                        $exists: true,
                    },
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "allVideos"
                }
            },
            {
                $unwind: {
                    path: "$allVideos"
                }
            },
            // either u can use or it will give full video details
            // {
            //     $project: {
            //         _id: "$allVideos._id",
            //         title: "$allVideos.title",
            //         description: "$allVideos.description",
            //         videoFile: "$allVideos.videoFile",
            //         duration:"$allVideos.duration"
            //     }
            // }

        ]);
        // ##less optimized and easy way
        // const allLikedVideos = await Like.find({
        //     LikedBy: userId,
        //     video: { 
        //         $exists: true ,

        //     },
        // });

        if (!allLikedVideos.length) {
            // throw new ApiResponse(202, allLikedVideos, ` No Liked Videos ${allLikedVideos.length}`);
            throw new ApiError(402, "no videos found")
        }
        return res.status(200)
            .json(new ApiResponse(200, allLikedVideos, `Fetched Successfully ${allLikedVideos.length}`))


    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!")
    }

})
// 


// extra end point for commuinty Post 
const getAllLikedCommunity = asyncHandler(async (req, res) => {

    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(400, "Unauthorized Request!!");
        }
        const allLikedCommunities = await Like.aggregate([
            {
                $match: {
                    likedBy: req.user?._id,
                    communityPost: {
                        $exists: true,
                    }
                }
            },
            {
                $lookup: {
                    from: "communityposts",
                    localField: "communityPost",
                    foreignField: "_id",
                    as: "allCommunitesPost"
                }
            },
            {
                $unwind: {
                    path: "$allCommunitesPost"
                }
            },
            //  the below pipeline is an optional
            {
                $lookup: {
                    from: "users",
                    let: {
                        ownerId: "$allCommunitesPost.owner"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [
                                        "$_id", "$$ownerId"
                                    ]
                                }
                            },

                        },
                        {
                            $project: {
                                password: 0,
                                refreshToken: 0,
                                email:0,
                                watchHistory:0,
                                createdAt:0,
                                updatedAt:0,

                            }
                        }
                    ],
                    as: "createdUser"
                }
            },
            {
                $unwind: {
                    path: "$createdUser"
                }
            },
        ])
        if (!allLikedCommunities.length) {
            // throw new ApiResponse(202, allLikedVideos, ` No Liked Videos ${allLikedVideos.length}`);
            throw new ApiError(402, "No Community post found")
        }


        return res.status(200)
            .json(new ApiResponse(200, allLikedCommunities, `Fetched Successfully ${allLikedCommunities.length}`))
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!")
    }

})

export {
    toggleVideoLike,
    toggleCommunityPostLike,
    getAllLikedVideos,
    getAllLikedCommunity
}