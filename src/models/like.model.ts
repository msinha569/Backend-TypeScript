

import mongoose, { Document, Model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


interface ILike extends Document{
    comment: Schema.Types.ObjectId
    video: Schema.Types.ObjectId
    likedBy: Schema.Types.ObjectId
    tweet: Schema.Types.ObjectId
}

const likeSchema = new Schema<ILike>({
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    }
})

likeSchema.plugin(mongooseAggregatePaginate)

export const Like: Model<ILike> = mongoose.model<ILike>("Like", likeSchema)