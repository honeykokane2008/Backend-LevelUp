import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"
import mongoose from "mongoose"
import { response } from "express"
import { ApiResponse } from "../utils/ApiResponse.js"


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

    const { username, email, fullname, password } = req.body

    console.log(username, email, fullname, password);

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

    const user = await User.create({
        username: username.toLowerCase(),
        email,
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