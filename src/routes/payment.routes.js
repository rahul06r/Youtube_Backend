import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middlware.js";
import { paymentProcess } from "../controllers/payment.controller.js";


const router = Router();


router.route("/create-intent/:channelID").post(verifyJWT, paymentProcess);



export default router;