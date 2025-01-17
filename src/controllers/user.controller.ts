import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { uploadOnCloudinary } from "../utils/cloudinary";
import ApiResponse from "../utils/ApiResponse";
import mongoose from "mongoose";
import jwt  from "jsonwebtoken";
import { DecodedToken } from "../middlewares/auth.middleware";

interface MulterRequest extends Request {
    files?: {
        avatar?: Express.Multer.File[];
        coverImage?: Express.Multer.File[];
    } | Express.Multer.File[]; 
}
interface TokenI {
    accessToken: string 
    refreshToken: string
}
const options = {
    httpOnly: true,
    secure: true
}

const generateAccessTokenAndRefreshToken = async function(userId:mongoose.Types.ObjectId): Promise<TokenI>  {
   try {
     const user = await User.findById(userId)
     if(user===null) throw new ApiError(403, "failed to generate token due to missing user id")
     const accessToken = user.generateAccessToken()
     const refreshToken = user.generateRefreshToken()
 
     user.refreshToken = refreshToken
     await user.save({validateBeforeSave: false})
 
     return {accessToken, refreshToken}
   } catch (error) {
     throw new ApiError(500, "something went wrong while generating refresh and access token")
   }
}

const getFilePath = (files: MulterRequest['files'], key: "avatar" | "coverImage"): string | undefined => {
    if (!files) 
        return undefined

    if (Array.isArray(files))
        return files[0]?.path

    if (files[key] && Array.isArray(files[key]))
        return files[key][0]?.path

    return undefined
}

const registerUser = asyncHandler(async(req:MulterRequest, res:Response): Promise<void> => {
    
    const {username, email, password, fullname} = req.body
    if(
        [username, email, password, fullname].some((field) =>
        field?.trim() === "" || field === undefined
        )){
            throw new ApiError(402, "All fields are required")
        }
        console.log(req.files);
        
    const existedUser = await  User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "user already exists")
    }

 
    const avatarLocalPath = getFilePath(req.files, "avatar")
    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar is required")
    }

    const coverImageLocalPath = getFilePath(req.files, "coverImage")
    if (!coverImageLocalPath){
        throw new ApiError(400, "coverImage is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!avatar){
        throw new ApiError(402,"avatar upload failed")
    }
    if (!coverImage){
        throw new ApiError(402,"coverImage upload failed")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        fullname,
        password,
        email,
        avatar: avatar.url,
        coverImage: coverImage.url
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser){
        throw new ApiError(500, "something went wrong while creating the user")
    }

    res
    .status(201)
    .json(new ApiResponse(200, {}, "User Registered Successfully!")
    )
    return
})

const loginUser = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const {username, email, password} = req.body
    
    if(!email && !username){
        throw new ApiError(403, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(400, "user not found")
    }
    
    const userApproved = await user.isPasswordCorrect(password)
    if (!userApproved){
        throw new ApiError(403, "Password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    const loggedInUser = await User.findOne(user._id).select("-password -refreshToken")
 
    res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser
        },"login successfull")
    )
    return
})

const logoutUser = asyncHandler(async(req: Request,res: Response): Promise<void> => {
 
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set: {
            refreshToken: ""
        }
    },
    {
        new: true
    })
    console.log(user);
    
    res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json( new ApiResponse(200,{}, "logout successful"))
    return
})

const refreshAccessToken = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "token not found")
    }
    
  try {
      const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET!) as DecodedToken
  
      const user = await User.findById(decodedToken._id)
      if (!user){
          throw new ApiError(402, "user not found")
      }
      if (incomingRefreshToken !== user.refreshToken){
          throw new ApiError(403, "refresh token is expired or in use in different session")
      }
  
      const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)
      
      res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(
          new ApiResponse(200, {}, "New Tokens generated successfully")
      )
  } catch (error) {
        if (error instanceof Error)
        throw new ApiError(404, error?.message)
        else 
        throw new ApiError(404, "Something unexpected happened")
  }
  return
})

const changeCurrentPassword =  asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const {oldPassword, newPassword} = req.body
    const userId = req.user?._id
    
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(401, "user is logged out")
    }
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordValid){
        throw new ApiError(401, "old password is incorrect")
    }
    if (oldPassword === newPassword){
        throw new ApiError(401, "new password is same as the old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed successfully"))
    return
})

const getCurrectUser = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    if (!req.user){
        throw new ApiError(400, "user not found")
    }
    const user = req.user
    res
    .status(200)
    .json(new ApiResponse(200, {user}, "user found"))
})

const updateUserDetails = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const {username, email, fullname} = req.body

    if(!username && !email && !fullname){
        throw new ApiError(400, "no new changes detected")
    }
    if (!req.user){
        throw new ApiError(400, "user not found")
    }
    
    const updates: {
        username?: string,
        email?: string,
        fullname?: string
    } = {}
    if(username) updates.username = username
    if(email) updates.email = email
    if(fullname) updates.fullname = fullname

    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(req.user._id)

    const user = await User.findByIdAndUpdate(req.user._id,{
        $set: {
            ...updates,
            refreshToken: refreshToken
            }
        },{
            new: true
        }).select("-password -refreshToken")
    
    res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user},"user update successful"))
    return
})

const changeProfilePicture = asyncHandler(async(req: MulterRequest, res: Response): Promise<void> => {


    const coverImageLocalPath = getFilePath(req.files, "coverImage")
    const avatarLocalPath = getFilePath(req.files, "avatar")

    const updates: Record<string, string> = {}
    if (coverImageLocalPath) {
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if (!coverImage){
            throw new ApiError(401, "coverImage upload failed")
        }
        updates.coverImage = coverImage.url
    }
    if (avatarLocalPath){
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        if (!avatar){
            throw new ApiError(400, "avatar file upload failed")
        }
        updates.avatar = avatar.url
    }  
    console.log(avatarLocalPath);
    
    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No files received (avatar or coverImage)");
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set: {
           ...updates
        }
        },{
            new: true
        })
    if (!user){
        throw new ApiError(401, "failed to update avatar")
    }

    res
    .status(200)
    .json(new ApiResponse(200,{avatarURL:updates.avatar, coverImage: updates.coverImage},"avatar update successfull"))
    return
}) 

const getUserChannelDetails = asyncHandler(async(req: Request, res: Response): Promise<void> => {
    const {username} = req.params
    console.log(username);
    
    if (!username?.trim()){
        throw new ApiError(401, "no username found")
    }
    const channelDetails = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                foreignField: "channel",
                localField: "_id",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                foreignField: "subscriber",
                localField: "_id",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                subscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ])

    if (!channelDetails){
        throw new ApiError(401, "no channel found")
    }

    res
    .status(200)
    .json ( new ApiResponse(200, {channelDetails}, "channel details fetched successfully"))
})
  

export
 {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrectUser,
    updateUserDetails,
    changeProfilePicture,
    getUserChannelDetails,
 }