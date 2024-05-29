import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import {
    getAllLikedVideos,
    toggleCommunityPostLike,
    toggleVideoLike,
} from "../controllers/like.contoller.js";

const router = Router()
router.route("/toggle-video/:videoId").patch(verifyJWT, toggleVideoLike)
router.route("/toggle-commu/:videoId").patch(verifyJWT, toggleCommunityPostLike)
router.route("/liked-vid").get(verifyJWT, getAllLikedVideos)


export default router;