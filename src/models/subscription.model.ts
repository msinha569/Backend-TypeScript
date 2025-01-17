import mongoose, { Schema, Document, Model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface ISubscription extends Document {
    subscriber: mongoose.Types.ObjectId;
    channel: mongoose.Types.ObjectId;
}

const subscriptionSchema: Schema<ISubscription> = new Schema<ISubscription>({
    subscriber: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    channel: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
});

subscriptionSchema.plugin(mongooseAggregatePaginate);

export const Subscription: Model<ISubscription> = mongoose.model<ISubscription>("Subscription", subscriptionSchema);
