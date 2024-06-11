import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription
} from "../controllers/subscriptions.controller.js";


const router = Router()


router.route("/toggle/:channelId").patch(verifyJWT, toggleSubscription)
router.route("/channel-subs/:channelId").get(verifyJWT, getUserChannelSubscribers)
router.route("/sub-channel/:subscriberId").get(verifyJWT, getSubscribedChannels)



export default router;