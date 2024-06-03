import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
// import {} from "../utils/ApiError"
import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js";




const addCommentToVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        if (!videoId && !isValidObjectId(videoId)) {
            throw new ApiError(404, "No video id found!!");
        }
        if (!content || content.trim() == "") {
            throw new ApiError(401, "Content required!");
        }
        const video = await Video.findById(videoId);


        if (!video) {
            throw new ApiError(400, "No video found!");
        }

        const addComment = await Comment.create(
            {
                content: content.trim(),
                commentedBy: req.user?._id,
                video: video._id
            }
        )
        if (!addComment) {
            throw new ApiError(500, "Something went wrong!!");
        }
        return res.status(200)
            .json(new ApiResponse(200, addComment, `Comment Added successfully`))
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!");
    }
})

// 
const updateCommentVideo = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;

    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        if (!commentId && !isValidObjectId(commentId)) {
            throw new ApiError(404, "No video id found!!");
        }
        if (!content || content.trim() == "") {
            throw new ApiError(401, "Content required!");
        }
        const updateComment = await Comment.findOneAndUpdate({
            $and: [
                { _id: commentId },
                { commentedBy: req.user?._id },
                {
                    video: {
                        $exists: true
                    }
                }
            ]
        }, {
            $set: {
                content: content.trim()
            }
        }, {
            new: true
        }
        )
        if (!updateComment) {
            throw new ApiError(500, "Something went wrong!!");
        }

        return res.status(200)
            .json(new ApiResponse(200, updateComment, `Comment Updated Sucessfully`))

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!");
    }
})

// 
const deleteCommentVideo = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        if (!commentId && !isValidObjectId(commentId)) {
            throw new ApiError(404, "No video id found!!");
        }
        const deleteComment = await Comment.findOneAndDelete({
            $and: [
                { _id: commentId },
                { commentedBy: req.user?._id },
                {
                    video: {
                        $exists: true
                    }
                }
            ]
        },);

        return res.status(200)
            .json(new ApiResponse(200, {}, "Deleted Successfully"))
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!");
    }
})
// 
const getAllVideosComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page, limit, sort } = req.query;
    const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sort: { createdAt: parseInt(sort) || 1 }
    }

    try {

        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        if (!videoId && !isValidObjectId(videoId)) {
            throw new ApiError(404, "No video id found!!");
        }
        const allComments = await Comment.aggregate(
            [
                {
                    $match: {
                        video: new mongoose.Types.ObjectId(videoId),
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "commentedBy",
                        foreignField: "_id",
                        as: "userInfo",
                        pipeline: [
                            {
                                $project: {
                                    username: 1,
                                    avatar: 1
                                }
                            }
                        ]
                    }
                },

                {
                    $addFields: {
                        userInfo: {
                            $first: "$userInfo"
                        }
                    }
                },
                {
                    $sort: {
                        createdAt: parseInt(sort) || 1
                    }
                },
                {
                    $limit: parseInt(limit)
                },
                {
                    $skip: (parseInt(page) - 1) * parseInt(limit)
                },
                {
                    $unwind: "$userInfo"
                },
            ])
        if (!allComments) {
            throw new ApiError(500, "Something went wrong!!");
        }
        // const result = await Comment.aggregatePaginate(
        //     allComments,
        //     options
        // )

        return res.status(200)
            .json(new ApiResponse(200, allComments, `Fetched Successfully  ${allComments.length} `))
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!");
    }

})

// 



export {
    addCommentToVideo,
    updateCommentVideo,
    deleteCommentVideo,
    getAllVideosComment
}