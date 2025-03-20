import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    stripeCustomerId: {
        type: String,
        unique: true,
    },
    stripeSubscriptionId: {
        type: String,
        required: true,
        unique: true,
    },

    status: {
        type: String,
        enum: ["active", "canceled", "expired", "paused"],
        default: "active",
    },
    currentPeriodStart: {
        type: Date,
        required: true,
    },
    currentPeriodEnd: {
        type: Date,
        required: true,
    },
}, { timestamps: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
