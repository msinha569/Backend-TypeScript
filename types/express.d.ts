import mongoose from "mongoose"

interface verifiedUser  {
    _id: mongoose.Types.ObjectId
}

declare global {
    namespace Express {
        interface Request {
            user?: verifiedUser
        }
    }
}
export {}