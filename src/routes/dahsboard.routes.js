
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import {
    getChannelStats,
    getChannelVideos
} from "../controllers/dashboard.controller.js";

const router = Router();

router.route("/getAllVideos").get(verifyJWT, getChannelVideos);
router.route("/channel-stat").get(verifyJWT, getChannelStats);


export default router;