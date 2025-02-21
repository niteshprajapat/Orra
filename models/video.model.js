import { type } from "express/lib/response";
import mongoose from "mongoose";


const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        default: "",
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    category: {
        type: String,
        enum: ['education', 'entertainment', 'gaming', 'vlogs', 'music', 'sports'],
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    tags: [
        {
            type: String,
        }
    ],
    visibility: {
        type: String,
        enum: ["public", "private", "unlisted"],
        default: "public",
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    views: {
        type: Number,
        default: 0,
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        }
    ],



}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);
export default Video;