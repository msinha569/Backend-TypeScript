

import mongoose, { Document, Model, Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


interface IPlaylist extends Document{
    name: string
    description: string
    owner: Schema.Types.ObjectId
    video: Schema.Types.ObjectId
}

const playlistSchema = new Schema<IPlaylist>({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    }
})

playlistSchema.plugin(mongooseAggregatePaginate)

export const Playlist: Model<IPlaylist> = mongoose.model<IPlaylist>("Playlist", playlistSchema)