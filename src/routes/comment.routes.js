import { Router } from "express";
import {
    addCommentToVideo,
    deleteCommentVideo,
    getAllVideosComment,
    updateCommentVideo,
} from "../controllers/comment.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";


const router = Router()

// Video Comment Deletion
router.route("/addComment-vid/:videoId").post(verifyJWT, addCommentToVideo)
router.route("/updateComment-vid/:commentId").patch(verifyJWT, updateCommentVideo)
router.route("/deleteComment-vid/:commentId").delete(verifyJWT, deleteCommentVideo)
router.route("/getAllComment-vid/:videoId").get(verifyJWT,getAllVideosComment)


export default router;