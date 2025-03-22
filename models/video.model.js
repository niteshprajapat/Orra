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
        url: {
            type: String,
            default: "",
        },
        public_id: {
            type: String,
            default: "",
        },
    },
    videoUrl: {
        url: {
            type: String,
            required: true,
        },
        public_id: {
            type: String,
            required: true,
        },
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
    viewedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        }
    ],
    reports: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            reason: {
                type: String,
                enum: ["spam", "misleading", "harmful", "violence", "hate_speech", "copyright", "other"],
                required: true,
            },
            message: {
                type: String
            },
            reportedAt: {
                type: Date,
                default: Date.now,
            },
        }
    ]




}, { timestamps: true });

const Video = mongoose.model('Video', videoSchema);
export default Video;