import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new screen(
    {
        subscriber: {
            typeof: Schema.Types.ObjectId,
            ref: "User"
        },
        channel: {
            typeof: Schema.Types.ObjectId,
            ref: "User"
        }
    }
)


export const Subscription = mongoose.model("Subscription", subscriptionSchema)