import express from 'express';
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser';

// config
dotenv.config({});


// initialization
const app = express();
const port = process.env.PORT || 5000;


// middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
// app.use(cors());
app.use(cookieParser());




// app home page
app.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: "This is Home Page for Orra!",
    });
});


// app listen
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})