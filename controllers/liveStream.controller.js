import LiveStream from '../models/livestream.model.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import crypto from 'crypto';


// startLiveStream
export const startLiveStream = async (req, res) => {
    try {
        const { title, description, } = req.body;
        const userId = req.user._id;
        const file = req.file;

        if (!title || !description) {
            return res.status(404).json({
                success: false,
                message: "All fields are required!",
            });
        }

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "Please provide Thumbnail!",
            });
        }


        let thumbnailData = {};
        if (file) {
            const result = await cloudinary.uploader.upload(file.file, {
                folder: "live_stream_thumbnails"
            });

            thumbnailData.url = result.secure_url;
            thumbnailData.public_id = result.public_id;
        }

        fs.unlinkSync(file.path);


        const streamKey = await crypto.randomBytes(16).toString("hex");


        const livestream = await LiveStream.create({
            userId,
            title,
            description,
            thumbnail: thumbnailData,
            streamKey,
        });


        // Notify users


        return res.status(201).json({
            success: false,
            message: "Live stream scheduled successfully! Start streaming in OBS.",
            livestream,
            rtmlUrl: `rtmp://localhost:1935/live/${streamKey}`,
            hlsUrl: `http://localhost:8000/live/${streamKey}/index.m3u8`,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in startLiveStream API!",
        });
    }
}