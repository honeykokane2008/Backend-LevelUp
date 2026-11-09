import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import mongoose from "mongoose"
import { response } from "express"
import { ApiResponse } from "../utils/ApiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"



const registerUser = asyncHandler(async (req, res, next) => {

    // take info fro user
    // check info is in proper form
    // check if info allredy exist
    // save avatar to local server
    // check avatar is saved
    // upload avatar to cloudinary
    // check avatar is uploaded
    // upload datat to user
    // chech data is uploaded to db
    // remove pasword and refreshToken from retrun response of user
    // return response to user

    const { username, email, fullname, password } = req.body;


    if (
        [username, email, fullname, password].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All fileds are required")
    }

    const userExist = await User.findOne({
        $or: [{ username }, { email }]

    });

    console.log("DB name at query time:", mongoose.connection.name);

    if (userExist) {
        throw new ApiError(409, "User with this email or username already exists");
    };

    const avatarLocalPath = req.files?.avatar[0]?.path;

    const coverimgLocalPath = req.files?.coverimg[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar img is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath, "avatars");
    const coverimg = await uploadOnCloudinary(coverimgLocalPath, "coverimgs");

    if (!avatar) {
        throw new ApiError(500, "Avatar upload failed");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        avatar: avatar.url,
        coverimg: coverimg.url || "",
        fullname,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "User not created due to some internal error");

    }


    return res.status(201).json(
        new ApiResponse(
            201, createdUser, "User registered successfully"));


});


export { registerUser }