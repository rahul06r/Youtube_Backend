
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import { getChannelVideos } from "../controllers/dashboard.controller.js";

const router = new Router();

router.route("/getAllVideos/").get(verifyJWT, getChannelVideos);


export default router;