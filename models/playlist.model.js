import mongoose from "mongoose";


const playlistSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
        },
    ],
    isDelete: {
        type: Boolean,
        default: false,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],



}, { timestamps: true });

const Playlist = mongoose.model('Playlist', playlistSchema);
export default Playlist;