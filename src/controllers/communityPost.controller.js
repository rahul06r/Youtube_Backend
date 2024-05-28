import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asynchandler.js"


import { CommunityPost } from "../models/communityPost.model.js"



const createCommunityPost = asyncHandler(async (req, res) => {
    try {
        const userId = req.userId?._id;
        if (!userId && isValidObjectId(userId)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        const { content } = req.body;
        if (!content) {
            throw new ApiError(400, "Content is needed!!");
        }
        const communityPost = await CommunityPost.create({
            owner: req.user?._id,
            content
        })
        const communityPosted = await CommunityPost.findById(communityPost?._id)

        if (!communityPosted) {
            throw new ApiError(500, "Something went wrong!!");
        }
        return res.status(200)
            .json(new ApiResponse(200, communityPosted, "Posted successfully!!"))
    } catch (error) {
        throw new ApiError(500, error.message || "Somenthing went wrong");

    }
})

//
const updateCommunityPost = asyncHandler(async (req, res) => {
    try {
        const { postId } = req.params;

        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        const { content } = req.body;
        if (!content) {
            throw new ApiError(400, "Content is needed!!");
        }
        if (!postId) {
            throw new ApiError(401, "Invalid Post Id!!");
        }
        // 66558a7aeb9461e049bb7368
        const postDeatils = await CommunityPost.findById(postId).select("-content")
        if (!postDeatils || !(req.user?._id.toString() === postDeatils.owner.toString())) {
            throw new ApiError(404, "unAuthorized Request of Updating Post!!!");
        }

        const updatedPost = await CommunityPost.findOneAndUpdate({
            _id: postId
        }, {
            $set: {
                content
            }
        }, {
            new: true
        }
        );
        if (!updatedPost) {
            throw new ApiError(500, "Somenthing went wrong while posting")
        }
        return res.status(200)
            .json(new ApiResponse(200, updatedPost, "Post Updated Successfully"))
    } catch (error) {
        throw new ApiError(500, error.message || "Somenthing went wrong");

    }
})


// 
const getUserCommunityPost = asyncHandler(async (req, res) => {

    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }

        const usercommunityPosts = await CommunityPost.aggregate([
            {
                $match: {
                    owner: req.user?._id,
                }
            },
            {
                $sort: {
                    createdAt: -1,
                    // change how ever you want 1 or -1
                }
            }
        ]);
        if (!usercommunityPosts.length) {
            throw new ApiResponse(400, "No Post available");
        }
        return res.status(200)
            .json(new ApiResponse(200, usercommunityPosts, `Fetched Successfully ${usercommunityPosts.length}`))
    } catch (error) {
        throw new ApiError(500, error.message || "Somenthing went wrong");

    }
})

// 
const deleteCommunityPost = asyncHandler(async (req, res) => {

    try {
        if (!req.user?._id && !isValidObjectId(req.user?._id)) {
            throw new ApiError(404, "UnAuthorized request!!");
        }
        const { postId } = req.params;
        if (!postId && !isValidObjectId(postId)) {
            throw new ApiError(400, "Post Id required!!")
        }
        const post = await CommunityPost.findOne({
            _id: postId
        }).select("-content")

        if (!post && !(post.owner.toString() === req.user?._id.toString())) {
            throw new ApiError(404, "unAuthorized Request of Deleting Post!!!");
        }
        const toBedeletedPost = await CommunityPost.findByIdAndDelete(post._id);
        if (!toBedeletedPost) {
            throw new ApiError(500, "Somenthing went wrong");
        }


        return res.status(200)
            .json(new ApiResponse(200, {}, "Community Post Deleted!!"))
    } catch (error) {
        throw new ApiError(500, error.message || "Somenthing went wrong");
    }

})


export {
    createCommunityPost,
    updateCommunityPost,
    getUserCommunityPost,
    deleteCommunityPost
}

