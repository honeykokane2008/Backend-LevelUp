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

    const owner = await User.findById(req.user?._id).select("-password -refreshToken");

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

export {
    publishVideo
}