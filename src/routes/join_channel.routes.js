import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middlware.js";
import { joinChannel } from "../controllers/joinChannel.controller.js"

const router =Router();
router.route("/channel/:channelID/:paymentIntentID").post(verifyJWT,joinChannel)



export default router;