import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import WatchHistory from "../models/watchHistory.model.js";
import Notification from "../models/notification.model.js";
import cloudinary from '../config/cloudinary.js';
import fs from "fs";
import { redisClient } from "../config/redis.js";
import mongoose from "mongoose";


// const uploadFromBuffer = async (buffer) => {
//     console.log("started")
//     return new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//             {
//                 resource_type: "video",
//                 folder: "videos",
//             },
//             (error, result) => {
//                 if (result) {
//                     resolve();
//                 } else {
//                     reject(error)
//                 }
//             }
//         );

//         stream.end(buffer);

//     })

// }



const uploadFromPath = (filePath) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: "video",
                folder: "videos",
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    // Delete the file after upload to save disk space
                    fs.unlinkSync(filePath);
                    resolve(result);
                }
            }
        );

        fs.createReadStream(filePath).pipe(stream);
    });
};





// createVideo
export const createVideo = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;
        const userId = req.user._id;
        const file = req.file;

        if (!title || !description || !category) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!",
            });
        }


        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Video is required!",
            });
        }

        console.log("file", file);


        const data = tags.split(",").map((tag) => tag.trim());
        console.log("data", data);

        // upload video file buffer to cloudinary
        const result = await uploadFromPath(file.path);
        console.log("result", result);

        const video = await Video.create({
            userId: userId,
            title,
            description,
            category,
            videoUrl: {
                url: result.secure_url,
                public_id: result.public_id,
            },
            tags: data,
        });

        const uploader = await User.findById(userId).populate({
            path: "subscribers",
            select: "-password",
        });
        console.log("uploader", uploader);

        if (uploader && uploader.subscribers.length > 0) {
            const notifications = uploader.subscribers.map((subscriberId) => ({
                sender: userId,
                receiver: subscriberId,
                type: "upload",
                videoId: video._id,
                priority: "high",
            }));

            await Notification.insertMany(notifications);

            console.log("Notifications send to all Subscribers!");
        }


        return res.status(201).json({
            success: true,
            message: "Video Uploaded Successfully!",
            video,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createVideo API!",
        });
    }
}


// uploadThumbnail
export const uploadThumbnail = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.user._id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "File is required!",
            });
        }

        const video = await Video.findById(videoId);

        if (video.thumbnail.public_id) {
            await cloudinary.uploader.destroy(video.thumbnail.public_id)
        }

        const result = await cloudinary.uploader.upload(file.path, {
            folder: "thumbnail_images"
        });

        // Delete the file from disk after successful upload
        fs.unlinkSync(file.path);

        video.thumbnail.url = result.secure_url;
        video.thumbnail.public_id = result.public_id;


        await video.save();

        return res.status(201).json({
            success: true,
            message: "Video Thumbnail Uploaded Successfully!",
            video,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in uploadThumbnail API!",
        });
    }
}



// deleteThumbnail
export const deleteThumbnail = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const video = await Video.findById(videoId);

        if (!video.thumbnail.public_id) {
            return res.status(400).json({
                success: false,
                message: "No Thumbnail Found!",
            })
        }

        // Delete from cloudinary
        await cloudinary.uploader.destroy(video.thumbnail.public_id);

        // Remove from DB
        video.thumbnail.url = "";
        video.thumbnail.public_id = "";

        await video.save();

        return res.status(200).json({
            success: true,
            message: "Thumbnail Deleted!",
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}

// updateVideoUrl
export const updateVideoUrl = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const video = await Video.findById(videoId);
        const file = req.file;


        if (video.videoUrl.public_id) {
            await cloudinary.uploader.destroy(video.videoUrl.public_id);
        }

        const result = await uploadFromPath(file.path);

        video.videoUrl.url = result.url;
        video.videoUrl.public_id = result.public_id;

        await video.save();

        return res.status(200).json({
            success: true,
            message: "Video Updated Successfully!",
            video,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}

// getAllVideosOfUserByUserId
export const getAllVideosOfUserByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const videos = await Video.find({ userId: userId, isDelete: false }).skip(skip).limit(limit).lean();

        const total = await Video.countDocuments({ userId: userId, isDelete: false });
        const totalPages = Math.ceil(total / limit);


        return res.status(200).json({
            success: true,
            message: "Video Updated Successfully!",
            totalVideos: videos.length,
            page,
            totalPages,
            videos,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}

// getAllVideosOfUserByUserId
export const changeVisibilityOfVideoByVideoId = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const { visibility } = req.body;

        if (!videoId || !visibility) {
            return res.status(404).json({
                success: false,
                message: "All fields are required!",
            });
        }

        if (!["public", "private", "unlisted"].includes(visibility)) {
            return res.status(400).json({
                success: false,
                message: "Invalid visibility! Use 'public', 'private', or 'unlisted'",
            });
        }

        const video = await Video.findOne({ _id: videoId, isDelete: false });

        if (video.status === "banned" && visibility !== "private") {
            return res.status(400).json({
                success: false,
                message: "Cannot change visibility of banned video to anything other than private!",
            });
        }

        video.visibility = visibility;
        await video.save();

        return res.status(200).json({
            success: true,
            message: `Video visibility updated to ${visibility}`,
            video,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}

// updateVideoDetails
export const updateVideoDetails = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;
        const videoId = req.params.videoId;
        const userId = req.user._id;

        const video = await Video.findById(videoId);
        if (video.userId.toString() !== userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are not allowed to update details!",
            });
        }

        if (title) {
            video.title = title;
        }

        if (description) {
            video.description = description;
        }
        if (category) {
            video.category = category;
        }

        if (tags) {
            video.tags = tags.split(",").map((tag) => tag.trim());
        }

        await video.save();

        return res.status(200).json({
            success: true,
            message: "Video Details Updated Successfully!",
            video,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}

// deleteVideoById
export const deleteVideoById = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.user._id;

        const video = await Video.findById(videoId);
        if (video.userId.toString() !== userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are not allowed to delete this video!",
            });
        }

        video.isDelete = true;

        await video.save();

        return res.status(200).json({
            success: true,
            message: "Video Deleted Successfully!",
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}

// restoreVideoById
export const restoreVideoById = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.user._id;

        const video = await Video.findById(videoId);
        if (video.userId.toString() !== userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are not allowed to delete this video!",
            });
        }

        video.isDelete = false;

        await video.save();

        return res.status(200).json({
            success: true,
            message: "Video Restored Successfully!",
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}

// getVideoById
export const getVideoById = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.user._id;

        const video = await Video.findById(videoId);

        return res.status(200).json({
            success: true,
            message: "Video fetched by Id!",
            video,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}

// increaseVideoView
export const increaseVideoView = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.user._id;

        if (!userId) {
            return res.status(200).json({
                success: true,
                message: "View count not updated (User not logged in).",
            });
        }

        const video = await Video.findById(videoId);

        if (!video.viewedBy.includes(userId)) {
            video.views += 1;
            video.viewedBy.push(userId);

            let userWatchHistory = await WatchHistory.findOne({ userId: userId });

            if (!userWatchHistory) {
                userWatchHistory = await WatchHistory.create({
                    userId: userId,
                    videos: [{ videoId }],
                })
            } else {
                const existingVideo = userWatchHistory.videos.find((v) => v.videoId.toString() === videoId.toString());
                if (existingVideo) {
                    existingVideo.watchedAt = new Date();
                } else {
                    userWatchHistory.videos.push({ videoId });
                }
            }

            await userWatchHistory.save();
            await video.save();
        }

        return res.status(200).json({
            success: true,
            message: "Video Count Updated!",
            video,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}

// trendingVideos
export const trendingVideos = async (req, res) => {
    try {

        // const videos = await Video.find({ isDelete: false }).sort({ views: -1, likes: -1, createdAt: -1 }).limit(20);

        // return res.status(200).json({
        //     success: true,
        //     message: "Trending Videos!",
        //     videos,
        // });


        let videos;
        const CACHE_EXPIRY_TIME = 120;

        if (redisClient.isReady) {
            videos = await redisClient.get("trendingVideos");
        }

        if (videos) {
            console.log("Cache hit!");
            videos = JSON.parse(videos);
            return res.status(200).json({
                success: true,
                message: "Trending Videos!",
                videos,
            });
        } else {
            console.log("Cache miss!");
            videos = await Video.find({ isDelete: false }).sort({ views: -1, likes: -1, createdAt: -1 }).limit(20);

            if (redisClient.isReady) {
                await redisClient.set("trendingVideos", JSON.stringify(videos), {
                    EX: CACHE_EXPIRY_TIME,
                });
            }

            return res.status(200).json({
                success: true,
                message: "Trending Videos!",
                videos,
            });
        }



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}

// getVideosByCategory
export const getVideosByCategory = async (req, res) => {
    try {
        const category = req.params.category;

        const videos = await Video.find({ category: category.toLowerCase(), isDelete: false }).sort({ createdAt: -1 });


        return res.status(200).json({
            success: true,
            message: "Catgeory Videos Found!",
            total: videos.length,
            videos,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getVideosByCategory API!",
        });
    }
}

// likeDislikeVideo
export const likeUnlikeVideo = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.user._id;
        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Video Not Found!",
            });
        }

        const video = await Video.findOne({ _id: videoId, isDelete: false });
        console.log("67c87c83b6fdb77f92ba08f8", video);

        if (!video.likes.includes(userId)) {
            // like
            await Video.findByIdAndUpdate(
                videoId,
                {
                    $push: { likes: userId }
                },
                { new: true }
            );

            await User.findByIdAndUpdate(
                userId,
                {
                    $push: { likedVideos: videoId },
                },
                { new: true },
            );


            if (video.userId.toString() !== userId.toString()) {
                const notification = await Notification.create({
                    receiver: video.userId,
                    sender: userId,
                    type: "like",
                    videoId: videoId,
                    priority: "high",
                });
            }


            return res.status(200).json({
                success: true,
                message: `You liked this Video!`,
            });
        } else {
            // unlike
            await Video.findByIdAndUpdate(
                videoId,
                {
                    $pull: { likes: userId }
                },
                { new: true }
            );

            await User.findByIdAndUpdate(
                userId,
                {
                    $pull: { likedVideos: videoId },
                },
                { new: true },
            );

            return res.status(200).json({
                success: true,
                message: `You Unliked this Video!`,
            });
        }



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in likeUnlikeVideo API!",
        });
    }
}

// dislikeUndislikeVideo
export const dislikeUndislikeVideo = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.user._id;
        if (!videoId) {
            return res.status(400).json({
                success: false,
                message: "Video Not Found!",
            });
        }

        const video = await Video.findOne({ _id: videoId, isDelete: false });
        console.log("67c87c83b6fdb77f92ba08f8", video);

        if (!video.dislikes.includes(userId)) {
            // dislike
            await Video.findByIdAndUpdate(
                videoId,
                {
                    $push: { dislikes: userId }
                },
                { new: true }
            );

            await User.findByIdAndUpdate(
                userId,
                {
                    $push: { dislikedVideos: videoId },
                },
                { new: true },
            );

            return res.status(200).json({
                success: true,
                message: `You Unliked this Video!`,
            });
        } else {
            // unlike
            await Video.findByIdAndUpdate(
                videoId,
                {
                    $pull: { dislikes: userId }
                },
                { new: true }
            );

            await User.findByIdAndUpdate(
                userId,
                {
                    $pull: { dislikedVideos: videoId },
                },
                { new: true },
            );

            return res.status(200).json({
                success: true,
                message: `You Undisliked this Video!`,
            });
        }



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in likeUnlikeVideo API!",
        });
    }
}

// searchVideo
export const searchVideo = async (req, res) => {
    try {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search Query is Required!"
            });
        }

        const videos = await Video.find({
            $and: [
                { isDelete: false },
                { visibility: "public" },
                {
                    $or: [
                        { title: { $regex: query, $options: 'i' } },
                        { tags: { $regex: query, $options: 'i' } },
                        { category: { $regex: query, $options: 'i' } },
                    ],
                },
            ],
        });

        return res.status(200).json({
            success: true,
            message: "Fetched Searched Videos",
            total: videos.length,
            videos,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in searchVideo API!",
        });
    }
}

// getRecommendedVideos
export const getRecommendedVideos = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const { limit = 10, page = 1 } = req.query;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(400).json({
                success: false,
                message: "Video Not Found!",
            });
        }


        const recommendedVideos = await Video.find({
            $and: [
                { isDelete: false },
                { visibility: "public" },
                { _id: { $ne: videoId } },
                {
                    $or: [
                        { category: video.category },
                        { tags: { $in: video.tags } },
                        { title: { $regex: video.title.split(" ")[0], $options: "i" } }
                    ]
                }
            ]
        }).sort({ views: -1, likes: -1, createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit))

        return res.status(200).json({
            success: true,
            message: "Recommended Videos!",
            total: recommendedVideos.length,
            recommendedVideos,
        });





    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in searchVideo API!",
        });
    }
}

// reportVideoById
export const reportVideoById = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const { reason, message } = req.body;
        const userId = req.user._id;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: "Reason is Required!",
            });
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video Not Found!",
            });
        }

        const alreadyReported = video.reports.some((report) => report.userId.toString() === userId.toString());

        if (alreadyReported) {
            return res.status(400).json({
                success: false,
                message: "You have already reported this video!",
            });
        }

        video.reports.push({ userId, reason, message });
        await video.save();

        return res.status(200).json({
            success: true,
            message: "Video reported Successfully!",
        });





    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in searchVideo API!",
        });
    }
}



// ADMIN Routes

// getAllVideos
export const getAllVideos = async (req, res) => {
    try {
        const videos = await Video.find({});

        return res.status(200).json({
            success: false,
            message: "Fetched All Videos",
            videos,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createVideo API!",
        });
    }
}

// getAllDeletedVideos
export const getAllDeletedVideos = async (req, res) => {
    try {
        const videos = await Video.find({ isDelete: true });

        return res.status(200).json({
            success: false,
            message: "Fetched All Deleted Videos",
            videos,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createVideo API!",
        });
    }
}

// getAllReportedVideos
export const getAllReportedVideos = async (req, res) => {
    try {
        const videos = await Video.find({ "reports.0": { $exists: true } });
        return res.status(200).json({
            success: false,
            message: "Fetched All Deleted Videos",
            videos,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createVideo API!",
        });
    }
}

// banVideoByVideoId
export const banVideoByVideoId = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        if (!videoId) {
            return res.status(404).json({
                success: false,
                message: "VideoId Not Found!",
            });
        }

        const video = await Video.findOne({ _id: videoId, isDelete: false });

        if (video.status === "banned") {
            return res.status(400).json({
                success: false,
                message: "Video is already Banned",
            });
        }

        video.status = "banned";
        video.visibility = "private";
        await video.save();

        const notification = await Notification.create({
            receiver: video.userId,
            sender: req.user._id,
            type: "video_banned",
            videoId,
            priority: "high",
        });

        return res.status(200).json({
            success: true,
            message: "Video has been banned successfully!",
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createVideo API!",
        });
    }
}

// unbanVideoByVideoId
export const unbanVideoByVideoId = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        if (!videoId) {
            return res.status(404).json({
                success: false,
                message: "VideoId Not Found!",
            });
        }

        const video = await Video.findOne({ _id: videoId, isDelete: false });

        if (video.status !== "banned") {
            return res.status(400).json({
                success: false,
                message: "Video is not Banned",
            });
        }

        video.status = "active";
        video.visibility = "public";
        await video.save();

        const notification = await Notification.create({
            receiver: video.userId,
            sender: req.user._id,
            type: "video_unbanned",
            videoId,
            priority: "high",
        });

        return res.status(200).json({
            success: true,
            message: "Video has been unbanned successfully!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createVideo API!",
        });
    }
}

// getVideoAnalytics for single video
export const getVideoAnalytics = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.user._id;

        const { startDate, endDate, page = 1, limit = 10 } = req.query;

        const video = await Video.findOne({ _id: videoId, userId, isDelete: false });
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found or you don't have access!",
            });
        }

        // Date filter for watch history
        const dateFilter = {};
        if (startDate) {
            dateFilter.$gte = new Date(startDate);
        }
        if (endDate) {
            dateFilter.$lte = new Date(endDate);
        }


        // Fetch watch history for detailed analytics
        const watchHistory = await WatchHistory.aggregate([
            {
                $match: {
                    "videos.videoId": videoId,
                }
            },
            {
                $unwind: "$videos"
            },
            {
                $match: {
                    "videos.videoId": videoId,
                }
            },
            dateFilter ? {
                $match: {
                    "videos.watchedAt": dateFilter
                }
            } : {
                $match: {}
            },
            {
                $group: {
                    _id: "$userId",
                    totalWatchTime: { $sum: "$videos.duration" },
                    lastWatched: { $max: "$videos.watchedAt" },
                },
            },
            {
                $sort: {
                    lastWatched: -1,
                }
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: parseInt(limit),
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                        {
                            $project: { fullname: 1, username: 1 },
                        }
                    ],
                },
            },
            {
                $unwind: "$user",
            },
            {
                $project: {
                    user: "$user",
                    totalWatchTime: 1,
                    lastWatched: 1,
                },
            },
        ]);

        // Total watch history records for pagination
        const totalWatchRecords = await WatchHistory.aggregate([
            {
                $match: { "videos.videoId": videoId },
            },
            {
                $unwind: "$videos",
            },
            {
                $match: { "videos.videoId": videoId },
            },
            dateFilter ? {
                $match: {
                    "videos.watchedAt": dateFilter
                }
            } : {
                $match: {}
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 }
                }
            },
        ]);

        // Total Stats from watch history
        const totalWatchStats = await WatchHistory.aggregate([
            { $match: { "videos.videoId": new mongoose.Types.ObjectId(videoId) } },
            { $unwind: "$videos" },
            { $match: { "videos.videoId": new mongoose.Types.ObjectId(videoId) } },
            dateFilter ? { $match: { "videos.watchedAt": dateFilter } } : { $match: {} },
            {
                $group: {
                    _id: null,
                    totalWatchTime: { $sum: "$videos.duration" },
                    uniqueViewers: { $addToSet: "$userId" },
                },
            },
        ]);

        const totalStats = totalWatchStats[0] || {
            totalWatchTime: video.watchTime,
            uniqueViewers: video.viewedBy,
        };

        return res.status(200).json({
            success: true,
            message: "Video analytics fetched successfully!",
            data: {
                video: {
                    title: video.title,
                    views: video.views,
                    watchTime: totalStats.totalWatchTime,
                    likes: video.likes.length,
                    dislikes: video.dislikes.length,
                    uniqueViewers: totalStats.uniqueViewers.length,
                    createdAt: video.createdAt,
                    updatedAt: video.updatedAt,
                },
                watchHistory: watchHistory,
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil((totalWatchRecords[0]?.count || 0) / limit),
                totalRecords: totalWatchRecords[0]?.count || 0,
            },
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getVideoAnalytics API!",
        });
    }
}



// getVideosStats
export const getVideosStats = async (req, res) => {
    try {

        const videoStats = await Video.aggregate([
            {
                $match: {
                    isDelete: false,
                }
            },
            {
                $facet: {
                    totalVideos: [
                        { $count: "count" }
                    ],
                    totalViews: [
                        {
                            $group: {
                                _id: null,
                                views: {
                                    $sum: "$views"
                                }
                            }
                        }
                    ],
                    totalWatchTime: [
                        {
                            $group: {
                                _id: null,
                                watchTime: {
                                    $sum: "$watchTime"
                                }
                            }
                        }
                    ],
                    activeVideos: [
                        {
                            $match: {
                                status: "active",
                            }
                        },
                        {
                            $count: "count"
                        }
                    ],
                    bannedVideos: [
                        {
                            $match: { status: "banned" }
                        },
                        {
                            $count: "count"
                        }
                    ],
                }
            },
            {
                $project: {
                    totalVideos: { $arrayElemAt: ["$totalVideos.count", 0] },
                    totalViews: { $arrayElemAt: ["$totalViews.views", 0] },
                    totalWatchTime: { $arrayElemAt: ["$totalWatchTime.watchTime", 0] },
                    activeVideos: { $arrayElemAt: ["$activeVideos.count", 0] },
                    bannedVideos: { $arrayElemAt: ["$bannedVideos.count", 0] },
                }
            }
        ]);

        console.log("videoStats", videoStats);


        return res.status(200).json({
            success: true,
            message: "Fetched Videos Stats",
            data: videoStats[0] || {
                totalVideos: 0,
                totalViews: 0,
                totalWatchTime: 0,
                videosByCategory: [],
                activeVideos: 0,
                bannedVideos: 0
            }
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getVideosStats API!",
        });
    }
}


// getTrendingVideosStats
export const getTrendingVideosStats = async (req, res) => {
    try {

        const trendingVideos = await Video.aggregate([
            {
                $match: {
                    isDelete: false,
                    status: "active",
                    visibility: "public",
                    createdAt: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $project: {
                    title: 1,
                    userId: 1,
                    views: 1,
                    watchTime: 1,
                    likes: {
                        $size: "$likes"
                    },
                    dislikes: {
                        $size: "$dislikes"
                    },
                    comments: {
                        $size: "$comments"
                    },
                    createdAt: 1,
                }
            },
            { $sort: { views: -1, watchTime: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "creator"
                }
            },
            {
                $unwind: "$creator"
            },
            {
                $project: {
                    title: 1,
                    views: 1,
                    watchTime: 1,
                    likes: 1,
                    dislikes: 1,
                    comments: 1,
                    createdAt: 1,
                    creator: {
                        username: "$creator.username",
                        email: "$creator.email"
                    }
                }
            }
        ]);




        return res.status(200).json({
            success: true,
            message: "Fetched Trending Videos",
            trendingVideos,
        })



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getVideosStats API!",
        });
    }
}



// getVideoStatsById
export const getVideoStatsById = async (req, res) => {
    try {
        const videoId = req.params.videoId;

        const videoStats = await Video.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(videoId),
                    isDelete: false,
                }
            },
            {
                $project: {
                    userId: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    watchTime: 1,
                    likes: { $size: "$likes" },
                    dislikes: { $size: "$dislikes" },
                    comments: { $size: "$comments" },
                    category: 1,
                    visibility: 1,
                    status: 1,
                    createdAt: 1,
                    dailyStats: 1,
                    reports: 1
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "creator"
                }
            },
            {
                $unwind: "$creator"
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    views: 1,
                    watchTime: 1,
                    likes: 1,
                    dislikes: 1,
                    comments: 1,
                    category: 1,
                    visibility: 1,
                    status: 1,
                    createdAt: 1,
                    dailyStats: 1,
                    reports: {
                        count: { $size: "$reports" },
                        reasons: "$reports.reason"
                    },
                    creator: {
                        username: "$creator.username",
                        email: "$creator.email"
                    }
                }
            }
        ]);

        console.log(videoStats);

        return res.status(200).json({
            success: true,
            message: "Fetched Stats of particular video by VideoId",
            data: videoStats[0],
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getVideosStats API!",
        });
    }
}


