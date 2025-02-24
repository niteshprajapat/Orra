import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { connectDB } from './config/database.js';
import authRoutes from './routes/auth.routes.js'
import rateLimit from 'express-rate-limit';

// config
dotenv.config({});
connectDB();


// initialization
const app = express();
const port = process.env.PORT || 5000;


const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 min
    max: 2,
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


// routes middleware
app.use("/api/v1/auth", authRoutes);



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