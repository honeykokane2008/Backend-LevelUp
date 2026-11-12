import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser
} from "../controllers/users.controller.js";


import express from "express";



const router = Router();


const app = express();
app.use((req, res, next) => {
    console.log("HIT:", req.method, req.originalUrl)
    next()
})

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

router.route("/getCurrentUser").get(verifyJWT, getCurrentUser);

export default router;