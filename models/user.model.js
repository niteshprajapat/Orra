import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    profilePicture: {
        type: String,
        default: "",
    },
    coverImage: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        maxlength: 500,
        default: "",
    },
    joinedOn: {
        type: Date,
        default: Date.now,
    },
    socialLinks: {
        twitter: { type: String },
        linkedin: { type: String },
        github: { type: String },
        personalWebsite: { type: String },
    },
    location: {
        type: String,
        default: "",
    },
    status: {
        type: String,
        enum: ["active", "banned", "suspended"],
        default: "active",
    },
    likedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            default: [],
        },
    ],
    dislikedVideos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            default: [],
        }
    ],
    subscribers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        }
    ],
    subscribedTo: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        }
    ],



    lastLogin: {
        type: Date,
        default: Date.now,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
    },
    emailVerificationTokenExpires: {
        type: Date,
    },




}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;