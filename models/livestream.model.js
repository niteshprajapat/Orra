import mongoose from 'mongoose';

const liveStreamSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    thumbnail: {
        url: {
            type: String,
            default: "",
        },
        public_id: {
            type: String,
            default: "",
        },
    },
    streamKey: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ["live", "ended", "scheduled"],
        default: "scheduled",
    },
    viewes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });

// Index for performance
liveStreamSchema.index({ userId: 1, status: 1, streamKey: 1 });

const LiveStream = mongoose.model("LiveStream", liveStreamSchema);
export default LiveStream;