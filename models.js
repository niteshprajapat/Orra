// Make this somme features like Twitter- 





const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" },
    about: { type: String, maxlength: 500 },
    socialLinks: {
        twitter: { type: String },
        linkedin: { type: String },
        github: { type: String },
        personalWebsite: { type: String },
    },
    location: { type: String },
    role: { type: String, enum: ['user', 'moderator', 'admin'], default: 'user' },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    dislikedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    notificationSettings: {
        commentNotifications: { type: Boolean, default: true },
        likeNotifications: { type: Boolean, default: true },
        subscriptionNotifications: { type: Boolean, default: true },
    },
    status: { type: String, enum: ['active', 'banned', 'suspended'], default: 'active' },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now }
});


const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, enum: ['education', 'entertainment', 'gaming', 'vlogs', 'music', 'sports'], required: true },
    tags: [{ type: String }],
    duration: { type: Number, required: true }, // Duration in seconds
    visibility: { type: String, enum: ['public', 'private', 'unlisted'], default: 'public' },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    processingStatus: { type: String, enum: ['uploaded', 'processing', 'ready'], default: 'uploaded' },
    analytics: {
        watchTime: { type: Number, default: 0 }, // Total watch time in seconds
        geographicData: [{ country: String, views: Number }]
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});


const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
    commenter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['approved', 'pending', 'flagged'], default: 'approved' },
    replies: [
        {
            content: { type: String, required: true },
            commenter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    editedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});


const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: ['like', 'comment', 'subscription', 'upload', 'reply'],
        required: true
    },
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video' },
    comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
    actionUrl: { type: String }, // Link to the relevant action (e.g., comment thread)
    isRead: { type: Boolean, default: false },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    metadata: { type: mongoose.Schema.Types.Mixed }, // Store extra details if needed
    createdAt: { type: Date, default: Date.now }
});


const playlistSchema = new mongoose.Schema({
    title: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    isPublic: { type: Boolean, default: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Shared playlist
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});


const historySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videos: [
        {
            video: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
            watchedAt: { type: Date, default: Date.now },
            watchProgress: { type: Number, default: 0 } // Progress in seconds
        }
    ]
});


