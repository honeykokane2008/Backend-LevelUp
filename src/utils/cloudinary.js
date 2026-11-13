import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import { ApiError } from "../utils/ApiError.js";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// middelwares

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        // console.log(`local file path got to uploadOnCloudinary`)

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })

        console.log(`response is clear in uploadOnCloudinary`)

        console.log(`file is uploded on url :`, response.url);
        fs.unlinkSync(localFilePath); // delete temp file after success
        return response;

    } catch (error) {
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath); // delete temp file after failure
        throw new  ApiError(400, error || "some problem in uploadOnCloudinary");
    }
};

export { uploadOnCloudinary };