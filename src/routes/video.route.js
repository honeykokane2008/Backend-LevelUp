import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { loadVideo } from "../middleware/video.middleware.js";
import {
    getAllVideo,
    updateVideoDetails,
    publishVideo,
    getVideoById
} from "../controllers/video.controller.js";

const router = express.Router();

router.route("/publishVideo").post(
    verifyJWT,
    upload.fields([
        { name: "video", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    publishVideo
)

router.route("/getAllVideo").get(
    verifyJWT,
    getAllVideo
)

router.route("/c/:videoId").get(
    verifyJWT,
    loadVideo,
    getVideoById
)

router.route("/c/:videoId/updateVideoDetails").patch(
    verifyJWT,
    loadVideo,
    updateVideoDetails
)


export default router