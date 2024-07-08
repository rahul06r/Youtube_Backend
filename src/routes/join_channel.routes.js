import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middlware.js";
import { getJoinedChannel, getJoinedUser, joinChannel } from "../controllers/joinChannel.controller.js"

const router =Router();
router.route("/channel/:channelID/:paymentIntentID").post(verifyJWT,joinChannel)


router.route("/joined-user").get(verifyJWT,getJoinedUser)
router.route("/joined-channel").get(verifyJWT,getJoinedChannel)



export default router;