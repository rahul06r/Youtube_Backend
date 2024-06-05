import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"
// import {} from "../utils/ApiError"
import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js";
import { CommunityPost } from "../models/communityPost.model.js";




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
    const { page, limit, videoId, sort } = req.query;
    try {

        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        if (!videoId && !isValidObjectId(videoId)) {
            throw new ApiError(404, "No video id found!!");
        }
        console.log("Video Id", videoId);



        const commentsAggregate = Comment.aggregate([
            {
                $match: {
                    video: new mongoose.Types.ObjectId(videoId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "commentedBy",
                    foreignField: "_id",
                    as: "owner",
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "comment",
                    as: "likes",
                },
            },
            {
                $addFields: {
                    likesCount: {
                        $size: "$likes",
                    },
                    owner: {
                        $first: "$owner",
                    },
                    isLiked: {
                        $cond: {
                            if: { $in: [req.user?._id, "$likes.likedBy"] },
                            then: true,
                            else: false
                        }
                    }
                },
            },
            {
                $project: {
                    content: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    likesCount: 1,
                    owner: {
                        username: 1,
                        fullName: 1,
                        avatar: 1,
                        _id:1,
                    },
                    isLiked: 1
                },
            },
        ]);

        if (!commentsAggregate) {
            throw new ApiError(500, "Something went wrong!!");
        }
        console.log("All comments", commentsAggregate.length);
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: ({
                createdAt: parseInt(sort) || 1
            })
        };
        const result = await Comment.aggregatePaginate(
            commentsAggregate,
            options
        )
        if (!result || result.length === 0) {
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "No commments in this video!!"))
        }

        return res.status(200)
            .json(new ApiResponse(200, result, `Fetched Successfully  ${result.docs.length} `))
    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!");
    }

})

// 
const addCommentToPost = asyncHandler(async (req, res) => {
    const { comPostId } = req.params;
    const { content } = req.body;
    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        if (!comPostId && !isValidObjectId(comPostId)) {
            throw new ApiError(404, "No CommunityPost id found!!");
        }
        if (!content || content.trim() == "") {
            throw new ApiError(401, "Content required!");
        }
        const findCommunityPost = await CommunityPost.findById(comPostId);
        if (!findCommunityPost) {
            throw new ApiError(400, "No Post ID found ");
        }
        const postComment = await Comment.create(
            {
                content: content.trim(),
                commentedBy: req.user?._id,
                communityPost: comPostId
            }

        );
        if (!postComment) {
            throw new ApiError(500, "Something went wrong!!");
        }

        return res.status(200)
            .json(new ApiResponse(200, postComment, "Commented Successfully Community Post"))

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!");
    }
});


// 
const updateCommentCommunityPost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;
    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        if (!commentId && !isValidObjectId(commentId)) {
            throw new ApiError(404, "No CommunityPost id found!!");
        }
        if (!content || content.trim() == "") {
            throw new ApiError(401, "Content required!");
        }
        const updateComment = await Comment.findOneAndUpdate(
            {
                $and: [
                    { _id: commentId },
                    { commentedBy: req.user?._id },
                    {
                        communityPost: {
                            $exists: true,
                        }
                    }
                ]
            },
            {
                $set: {
                    content: content.trim(),
                }
            }, {
            new: true
        }
        );
        if (!updateComment) {
            throw new ApiError(400, "Cannot be updated");
        }
        return res.status(200)
            .json(new ApiResponse(200, updateComment, "Updated Comment Post Successfully"))

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!");
    }
});


// 

const deleteCommentCommunityPost = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        if (!commentId && !isValidObjectId(commentId)) {
            throw new ApiError(404, "No CommunityPost id found!!");
        }
        const deletedComment = await Comment.findOneAndDelete({
            $and: [
                { _id: commentId },
                { commentedBy: req.user?._id },
                {
                    communityPost: {
                        $exists: true
                    }
                }
            ]
        })
        if (!deleteCommentVideo) {
            throw new ApiError(500, "Something went wrong");
        }
        return res.status(200)
            .json(new ApiResponse(200, {}, "Comment on  Community Post Deleted Succeesfully "))

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!");
    }
});

// 
const getAllCommentsOnCommunityPost = asyncHandler(async (req, res) => {
    const { page, limit, comPostId, sort } = req.query;
    // const {  } = req.params;
    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        if (!comPostId && !isValidObjectId(comPostId)) {
            throw new ApiError(404, "No video id found!!");
        }
        const commentsAggregate = Comment.aggregate([
            {
                $match: {
                    communityPost: new mongoose.Types.ObjectId(comPostId),
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "commentedBy",
                    foreignField: "_id",
                    as: "owner",
                },
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "comment",
                    as: "likes",
                },
            },

            {
                $addFields: {
                    likesCount: {
                        $size: "$likes",
                    },
                    owner: {
                        $first: "$owner",
                    },
                    likeId: "$likes._id",
                    isLiked: {
                        $cond: {
                            if: { $in: [req.user?._id, "$likes.likedBy"] },
                            then: true,
                            else: false
                        }
                    }
                },
            },
            {
                $project: {
                    content: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    likesCount: 1,
                    likedId: 1,
                    owner: {
                        username: 1,
                        fullName: 1,
                        avatar: 1,
                    },
                    isLiked: 1
                },
            },
        ]);
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: {
                createdAt: parseInt(sort) || 1
            }
        };
        if (!commentsAggregate) {
            throw new ApiError(500, "Something went wrong!!");
        }
        const allComments = await Comment.aggregatePaginate(
            commentsAggregate,
            options
        );


        if (!allComments || allComments.length === 0) {
            return res
                .status(200)
                .json(new ApiResponse(200, {}, "No commments in this video!!"))
        }
        return res.status(200)
            .json(new ApiResponse(200, allComments, `Fetched Successfully  ${allComments.docs.length} `))

    } catch (error) {
        throw new ApiError(500, error.message || "Something went wrong!!");
    }
})






export {
    addCommentToVideo,
    updateCommentVideo,
    deleteCommentVideo,
    getAllVideosComment,
    addCommentToPost,
    updateCommentCommunityPost,
    deleteCommentCommunityPost,
    getAllCommentsOnCommunityPost
}