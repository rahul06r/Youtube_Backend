import { Router } from "express";
import {
    addCommentToPost,
    addCommentToVideo,
    deleteCommentCommunityPost,
    deleteCommentVideo,
    getAllCommentsOnCommunityPost,
    getAllVideosComment,
    updateCommentCommunityPost,
    updateCommentVideo,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";


const router = Router()

// Video Comment Deletion
router.route("/addComment-vid/:videoId").post(verifyJWT, addCommentToVideo)
router.route("/updateComment-vid/:commentId").patch(verifyJWT, updateCommentVideo)
router.route("/deleteComment-vid/:commentId").delete(verifyJWT, deleteCommentVideo)
router.route("/getAllComment-vid").get(verifyJWT, getAllVideosComment)



// for communitypost
router.route("/addComment-com/:comPostId").post(verifyJWT, addCommentToPost)
router.route("/updateComment-com/:commentId").patch(verifyJWT, updateCommentCommunityPost)
router.route("/deleteComment-com/:commentId").delete(verifyJWT, deleteCommentCommunityPost)
router.route("/getAllComment-com").get(verifyJWT, getAllCommentsOnCommunityPost)
export default router;