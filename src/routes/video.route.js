import express from "express";
import { getAllVideo, publishVideo } from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

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


export default router