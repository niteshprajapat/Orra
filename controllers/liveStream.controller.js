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
            success: true,
            message: "Live stream scheduled successfully! Start streaming in OBS",
            livestream,
            rtmlUrl: `rtmp://localhost:1935/live/${streamKey}`,
            hlsUrl: `http://localhost:8000/live/${streamKey}/index.m3u8`,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in startLiveStream API!",
        });
    }
}

// endLiveStream
export const endLiveStream = async (req, res) => {
    try {
        const liveStreamId = req.params.liveStreamId;
        const userId = req.user._id;
        if (!liveStreamId) {
            return res.status(400).json({
                success: false,
                message: "LiveStreamId is not provided!"
            });
        }

        const liveStream = await LiveStream.findOne({ _id: liveStreamId, userId: userId });

        if (!liveStream || liveStream.isDeleted) {
            return res.status(404).json({
                success: false,
                message: "LiveStream Not Found!"
            })
        }

        liveStream.status = "ended";

        await liveStream.save();

        // Notify users

        if (liveStream.thumbnail.public_id) {
            await cloudinary.uploader.destroy(liveStream.thumbnail.public_id)
        }

        return res.status(200).json({
            success: true,
            message: "LiveStream Ended Successfully!",

        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in EndLiveStream API!",
        });
    }
}


// Get active live streams
export const getActiveLiveStreams = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const liveStreams = await LiveStream.find({ status: "live", isDeleted: false })
            .populate("userId", "fullname username profilePicture.url")
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await LiveStream.countDocuments({ status: "live", isDeleted: false });

        // Add HLS URLs
        const streamsWithUrls = liveStreams.map((stream) => ({
            ...stream._doc,
            hlsUrl: `http://localhost:8000/live/${stream.streamKey}/index.m3u8`, // Update with public URL
        }));

        return res.status(200).json({
            success: true,
            message: "Fetched active live streams successfully!",
            liveStreams: streamsWithUrls,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("Error in getActiveLiveStreams API:", error.message);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};