import mongoose, { Document, Model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


interface IComment extends Document{
    owner: Schema.Types.ObjectId
    content: string
    video: Schema.Types.ObjectId
}

const commentSchema = new Schema<IComment>({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: true
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    }
})

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment: Model<IComment> = mongoose.model<IComment>("Comment", commentSchema)