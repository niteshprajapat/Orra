import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema({
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ['like', 'comment', 'subscription', 'upload', 'reply'],
        required: true,
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
    },
    commentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },




}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;