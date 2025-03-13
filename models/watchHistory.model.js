import mongoose from "mongoose";


const watchHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    videos: [
        {
            videoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
                required: true
            },
            watchedAt: {
                type: Date,
                default: Date.now,
            },
            isDeleted: {
                type: Boolean,
                default: false,
            },
        }
    ]

}, { timestamps: true });

const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);
export default WatchHistory;