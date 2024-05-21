import { Router } from "express";
import {
    changePassword,
    getUserChannelProfile,
    getUserWatchHistroy,
    getcurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDeatils,
    userAvatarUpdate,
    userCoverUpdate
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middlware.js";


const router = Router()

// controller last part
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)


// login
router.route("/login").post(loginUser)


// secured logout
router.route("/logout").post(verifyJWT, logoutUser)


// 
router.route("/refresh-token").post(refreshAccessToken)


// 
router.route("/change-password").post(verifyJWT, changePassword)
// 
router.route("/current-user").get(verifyJWT, getcurrentUser)

// 
router.route("/update-account").patch(verifyJWT, updateAccountDeatils)

// 
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), userAvatarUpdate)

// 
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), userCoverUpdate)

// 
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

// 
router.route("/history").get(verifyJWT, getUserWatchHistroy)

// 





export default router;