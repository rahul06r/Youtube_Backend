import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import {
    getAllLikedVideos,
    toggleCommunityPostLike,
    toggleVideoLike,
} from "../controllers/like.contoller.js";

const router = Router()
router.route("/toggle-video/:videoId").post(verifyJWT, toggleVideoLike)
router.route("/toggle-commu/:postId").post(verifyJWT, toggleCommunityPostLike)
router.route("/liked-vid").get(verifyJWT, getAllLikedVideos)


export default router;