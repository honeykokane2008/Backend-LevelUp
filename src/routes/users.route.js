import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserTextDetails,
    updateUserAvatar,
    updateUserCoverImg,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/users.controller.js";


const router = express.Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverimg", maxCount: 1 }
    ]),
    registerUser
);

router.route("/login").post(loginUser);

//secured route

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refreshToken").post(refreshAccessToken);

router.route("/changePass").post(verifyJWT, changeCurrentPassword);

router.route("/changeDetails").patch(verifyJWT, updateUserTextDetails);

router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);

router.route("/updateAvatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
);

router.route("/updateCoverImg").patch(
    verifyJWT,
    upload.single("coverimg"),
    updateUserCoverImg
);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/getWatchHistory").get(verifyJWT, getWatchHistory);



export default router;