import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
import { Like } from "../models/like.model.js";


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
        const allLikedVideos = await Like.aggregate([
            {
                $match: {
                    likedBy: req.user?._id
                }
            }
        ]);

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

export {
    toggleVideoLike,
    toggleCommunityPostLike,
    getAllLikedVideos
}