import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const publishVideo = asyncHandler(async (req, res) => {

    // user will be loged in
    // user will click on upload video
    // new page will open
    // video title will be taken
    // video discription will be taken(optional)
    // video thumbnail will be taken (optional)
    // video will need to be uploaded
    // video will save locally
    // upload video on cloudinary
    // upload data to db
    // check data is uploaded to db
    // return response

    const { description, title } = req.body;

    const owner = await User.findById(req.user?._id).select("-password -refreshToken");

    if ([title, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "title is required")
    }

    const videoLocalPath = req.files?.video[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "video local path or thumbnail local path not found");
    }

    const video = await uploadOnCloudinary(videoLocalPath, "video");

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath, "thumbnail");

    if (!video || !thumbnail) {
        throw new ApiError(400, "video or thumbnail not uploaded");
    }

    const publishedVideo = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        owner: owner._id,
        title: title,
        description: description,
        duration: video.duration,
        views: "",
        isPublished: true
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                publishedVideo,
                "video published"
            )
        )

});

const getAllVideo = asyncHandler(async (req, res) => {

    const ownerId = req.user?._id;

    if (!ownerId) {
        throw new ApiError(400, "owner id not found");
    }

    const allVideos = await Video.aggregate([
        {
            $match: {
                owner: ownerId
            }
        }, {
            $project: {
                thumbnail: 1,
                owner: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1
            }
        }
    ])

    if (allVideos.length === 0) {
        throw new ApiError(400, "all videos not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                allVideos,
                "video is send"
            )
        )
});

const getVideoById = asyncHandler(async (req, res) => {
    const videoId = req.video?._id;

    if (!videoId) {
        throw new ApiError(400, "video id not found")
    }

    const video = await Video.findById(videoId).select(
        "videoFile thumbnail owner title description duration views isPublished"
    );

    if (!video) {
        throw new ApiError(400, "video not fetched")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "video is fetched"
            )
        )
});

const updateVideoDetails = asyncHandler(async (req, res) => {

    const { updatedTitle, updatedDescription } = req.body;

    if (!updatedTitle && !updatedDescription) {
        throw new ApiError(400, "give updated title or updated description")
    }

    let video;

    if (updatedDescription) {
        video = await Video.findByIdAndUpdate(
            req.video?._id,
            {
                $set: {
                    description: updatedDescription
                }
            },
            { new: true }
        ).select(
            "-duration -views -videoFile"
        )

        if (!video) {
            throw new ApiError(400, "description update got error")
        }
    }

    if (updatedTitle) {
        video = await Video.findByIdAndUpdate(
            req.video?._id,
            {
                $set: {
                    title: updatedTitle
                }
            },
            { new: true }
        ).select(
            "-duration -views -videoFile"
        )

        if (!video) {
            throw new ApiError(400, "title update got error")
        }
    }


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "details updated"
            )
        )
});

const deleteVideo = asyncHandler(async (req, res) => {

    const deletedVideo = await Video.findByIdAndDelete(req.video?._id);

    if (!deleteVideo) {
        throw new ApiError(400, "video not deleted")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {deleteVideo},
                "video deleted"
            )
        )
});

const togglePublishStatus = asyncHandler(async (req, res) => {

});

const updatedThumbnail = asyncHandler(async (req, res) => {

});

export {
    publishVideo,
    getAllVideo,
    getVideoById,
    updateVideoDetails,
    deleteVideo,
    togglePublishStatus,
    updatedThumbnail
}