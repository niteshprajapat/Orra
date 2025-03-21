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
        // required: true,
    },
    googleId: {
        type: String, // Stores the Google ID for OAuth users
        unique: true,
        sparse: true, // Allows null values while enforcing uniqueness
    },
    githubId: {
        type: String, // Stores the GitHub ID for OAuth users
        unique: true,
        sparse: true,
    },
    isDelete: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    profilePicture: {
        url: {
            type: String,
            default: "",
        },
        public_id: {
            type: String,
            default: "",
        },
    },
    coverImage: {
        url: {
            type: String,
            default: "",
        },
        public_id: {
            type: String,
            default: "",
        },
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
    otp: {
        type: Number,
    },
    optExpires: {
        type: Date,
    },

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

    resetToken: {
        type: Number
    },
    resetTokenExpires: {
        type: Date,
    },


    loginHistory: [
        {
            ip: String,
            device: String,
            timestamp: { type: Date, default: Date.now },
            status: { type: String, enum: ["success", "failed"], default: "success" },
        }
    ],


    emailVerificationToken: { type: String },
    emailVerificationTokenExpires: { type: Date },

    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscription",
    },


}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;