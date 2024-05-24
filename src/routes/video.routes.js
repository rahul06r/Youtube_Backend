import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { deleteVideoFile, getAllVideos, getVideoId, publishvideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";


const router = Router()

router.route("/video-upload").post(verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishvideo
)


router.route("/").get(verifyJWT, getAllVideos)
router.route("/vid/:videoId").get(getVideoId)
router.route("/update-vid/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateVideo)

router.route("/delete-vid/:videoId").delete(verifyJWT, deleteVideoFile)
router.route("/toggle/publish-vid/:videoId").post(verifyJWT, togglePublishStatus)
// ||above we used post bcz we are just hitting the end point and not sending any data! ,if we send any data we should patch



export default router