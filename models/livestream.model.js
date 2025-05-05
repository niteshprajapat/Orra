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
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    thumbnail: {
        url: String,
        public_id: String,
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
    viewers: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        trim: true,
    },
    tags: [
        {
            type: String,
            trim: true,
        },
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