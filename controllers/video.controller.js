import Video from "../models/video.model.js";
import cloudinary from '../config/cloudinary.js';
import fs from "fs";


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

        const videos = await Video.find({ userId: userId, isDelete: false }).lean();



        return res.status(200).json({
            success: true,
            message: "Video Updated Successfully!",
            total: videos.length,
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



