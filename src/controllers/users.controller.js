import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import { response } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { upload } from "../middleware/multer.middleware.js";


const generateAccessTokenAndRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();

        user.refreshtoken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "problem in generating access token and refresh token");
    }
}


const registerUser = asyncHandler(async (req, res) => {

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

    //    const coverimgLocalPath = req.files?.coverimg[0]?.path;
    // let coverimg;
    let coverimgLocalPath;
    if (req.files && req.files.coverimg && req.files.coverimg.length > 0) {
        coverimgLocalPath = req.files.coverimg[0].path;
    }

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
        coverimg: coverimg?.url || "",
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


const loginUser = asyncHandler(async (req, res) => {
    //     take data
    //     check data
    //     find user
    //     check password
    //     generate tokens
    //     give tokens through secured cookies
    //     return response

    const { email, password, username } = req.body || {};

    if (!email && !username) {
        throw new ApiError(400, "give email or username");
    }

    if (!password) {
        throw new ApiError(400, "password is required");
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if (!user) {
        throw new ApiError(404, "user not found, please register");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    };

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const LoggedInUser = await User.findById(user._id).select("-password -refreshtoken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: LoggedInUser, accessToken, refreshToken },
                "user logged in successfully"
            )
        )
});

const logoutUser = asyncHandler(async (req, res) => {

    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true
        }
    )


    const options = {
        httpOnly: true,
        secure: true
    };


    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200,
                {},
                "user logged out successfully"
            )
        )

});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {

        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "incoming refresh token not reached")
        }

        const decodedIncomingRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedIncomingRefreshToken?._id)

        if (!user) {
            throw new ApiError(401, "user not found");
        }

        if (incomingRefreshToken !== user?.refreshtoken) {
            throw new ApiError(401, "refresh token not matched")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "refreshed token and access token updated and send"

                )
            )
    } catch (error) {
        throw new ApiError(400, error || "problem in refresh Access Token ")
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {


    const { oldPassword, newPassword } = req.body


    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "password is not correct")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })


    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "password is changed")
        )

});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "user fetched"
            )
        )
});


const updateUserTextDetails = asyncHandler(async (req, res) => {
    const { updatedFullName, updatedEmail } = req.body;

    if (!updatedFullName && !updatedEmail) {
        throw new ApiError(200, "give updated full name or updated email")
    }

    let user
    if (updatedEmail) {

        user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    email: updatedEmail
                }
            },
            { new: true }
        ).select("-password")

    }


    if (updatedFullName) {

        user = await User.findByIdAndUpdate(
            req.user?._id,
            {
                $set: {
                    fullname: updatedFullName
                }
            },
            { new: true }
        ).select("-password")

    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "account detals updated"
            )
        )

})


const uddateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path


    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar local path not found");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "avatar img not upload");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select("-password")


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { user },
                "avatar updated"
            )
        )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserTextDetails,
    uddateUserAvatar
}