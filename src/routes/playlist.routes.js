import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";

const router = Router();

router.route("/create-play").post(verifyJWT, createPlaylist)
router.route("/getUser-play").get(verifyJWT, getUserPlaylists)
router.route("/getplay/:playlistId").get(verifyJWT, getPlaylistById)
router.route("/addVideo/:playlistId/:videoId").patch(verifyJWT, addVideoToPlaylist)
router.route("/removeVideo/:playlistId/:videoId").patch(verifyJWT, removeVideoFromPlaylist)
router.route("/delete/:playlistId").delete(verifyJWT,deletePlaylist);
router.route("/update/:playlistId").patch(verifyJWT, updatePlaylist)




export default router;