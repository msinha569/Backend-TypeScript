import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model"
import {User} from "../models/user.model"
import {ApiError} from "../utils/ApiError"
import {asyncHandler} from "../utils/asyncHandler"
import {uploadOnCloudinary} from "../utils/cloudinary"
import { Request, Response } from "express"
import ApiResponse from "../utils/ApiResponse"


const getAllVideos = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page = 1, limit = 10, query='', sortBy='createdAt', sortType='asc' } = req.query
    const userId = req.user?._id
    console.log(page, limit, query, sortBy, sortType, userId);
    
    const matchStage: Record<string, any> = {}
    if (query){
        matchStage.title = {
            $regex: query,
            $options: "i"
        }
    }
    if (typeof userId === "string" && isValidObjectId(userId)){
        matchStage.userId = new mongoose.Types.ObjectId(userId);
    }

    if (typeof sortBy !== "string" || typeof page !== "string" || typeof limit !== "string") {
        throw new ApiError(400, "Invalid input: sortBy, page, and limit must all be strings.");
    }
    

    const sortOptions: Record<string, -1 | 1> = {
        [sortBy]: sortType==="asc"?1:-1
    }

    const pipeline: mongoose.PipelineStage[] = [
        {
            $match: matchStage
        },
        {
           $sort: sortOptions 
        },
        {
            $skip: (parseInt(page)-1)* parseInt(limit)
        },
        {
            $limit: parseInt(limit)
        },
 
        {
            $project: {
                title: 1,
                description: 1,
                videofile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                owner: 1
            }
        }
    ]

    const video = await Video.aggregate(pipeline)

    
    const totalVideos = await Video.countDocuments(matchStage);


     res.status(200).json(new ApiResponse(200, { video, totalVideos, page, limit }, "Get All videos Successfully"));
     return
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}