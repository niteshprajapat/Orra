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
            unique: true,
        },
    ],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
    isDelete: {
        type: Boolean,
        default: false,
    },
    visibility: {
        type: String,
        enum: ["public", "private", "unlisted"],
        default: "public",
    },
    views: {
        type: Number,
        default: 0,
    },
    viewedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],



}, { timestamps: true });

const Playlist = mongoose.model('Playlist', playlistSchema);
export default Playlist;