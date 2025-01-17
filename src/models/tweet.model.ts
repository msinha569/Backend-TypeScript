import mongoose, { Document, Model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


interface ITweet extends Document{
    owner: Schema.Types.ObjectId
    content: string
}

const tweetSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    content: {
        type: String
    }
})

tweetSchema.plugin(mongooseAggregatePaginate)

export const Tweet: Model<ITweet> = mongoose.model<ITweet>("Tweet",tweetSchema)