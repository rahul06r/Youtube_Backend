import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import {
    createCommunityPost,
    deleteCommunityPost,
    getUserCommunityPost,
    updateCommunityPost
} from "../controllers/communityPost.controller.js";


const router = Router();


router.route("/post-com").post(verifyJWT, createCommunityPost)
router.route("/updatepost-com/:postId").patch(verifyJWT, updateCommunityPost)
router.route("/getpost-com").get(verifyJWT, getUserCommunityPost)
router.route("/deletepost-com/:postId").delete(verifyJWT, deleteCommunityPost)


export default router;


// 665576cc9a37db5ec1f7d821

