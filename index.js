import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import session from 'express-session';
import useragent from 'express-useragent';
import passport from 'passport';
import { connectDB } from './config/database.js';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import videoRoutes from './routes/video.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import watchHistoryRoutes from './routes/watchHistory.routes.js';
import commentRoutes from './routes/comment.routes.js';
import chatRoutes from './routes/chat.routes.js';
import './config/passport.js';
import { connectToRedis } from './config/redis.js';

/**
 * 
 * 
 * Build feature like save to library just like youtube have.
 * 
 */


// config
dotenv.config({});
connectDB();
// connectToRedis();

// export const redisClient = redis.createClient({
//     password: process.env.REDIS_PASSWORD,
//     socket: {
//         host: "redis-10910.c99.us-east-1-4.ec2.redns.redis-cloud.com",
//         port: 10910,
//     }
// });

// redisClient.connect().then(() => {
//     console.log("Connected to Redis!");
// }).catch((error) => {
//     console.log(error);
// });




// initialization
const app = express();
const port = process.env.PORT || 5000;


const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 10,
    message: {
        success: false,
        message: "Too many request, please try again later!",
    },
    headers: true,
})


app.use(limiter);

// middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
// app.use(cors());
app.use(cookieParser());
app.use(useragent.express());
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// routes middleware
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/playlists", playlistRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/watchHistory", watchHistoryRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/chats", chatRoutes);



// app home page
app.get('/health', (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Server Up for Orra!",
    });
});


// app listen
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})