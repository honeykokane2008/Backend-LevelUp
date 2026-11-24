import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";


export const loadVideo = asyncHandler(async (req, _, next) => {
    try {
        const { videoId } = req.params;

        if (!isValidObjectId(videoId)) {
            throw new ApiError(200, "id not validate");
        }

        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(400, "video not found");
        }

        req.video = video;
        next();

    } catch (error) {
        throw new ApiError(400, "can not load video")
    }
})