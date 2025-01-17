import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from './ApiError';
import fs from "fs"

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface UploadApiResponse {
    url: string
  
}

const uploadOnCloudinary = async (localFilePath: string): Promise<UploadApiResponse | null> => {
    if (!localFilePath)
        throw new ApiError(400, "No File Found")
    try {
        const response =  await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"})
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        console.log(error);
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadOnCloudinary}