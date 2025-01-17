
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";

export interface DecodedToken {
    _id: string
}

const verifyJWT = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
        throw new ApiError(403, "No token was found")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as DecodedToken;
    if (!decodedToken._id) {
        throw new ApiError(400, "ID not found in token")
    }

    const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken")
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    
    req.user = user
    console.log(user._id);
    
    next();
});

export default verifyJWT;
