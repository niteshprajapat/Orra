import Playlist from "../models/playlist.model.js";
import Video from "../models/video.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from 'fs';


// createPlaylist
export const createPlaylist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!",
            });
        }

        const playlist = await Playlist.create({
            title,
            userId,
        });

        return res.status(201).json({
            success: true,
            message: "Playlist Created Successfully!",
            playlist,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPlaylist API"
        })
    }
}

// uploadPlaylistThumbnail
export const uploadPlaylistThumbnail = async (req, res) => {
    try {
        const userId = req.user._id;
        const playlistId = req.params.playlistId;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "File is required!",
            });
        }

        const playlist = await Playlist.findById(playlistId);

        if (playlist.thumbnail.public_id) {
            await cloudinary.uploader.destroy(playlist.thumbnail.public_id);
        }

        const result = await cloudinary.uploader.upload(file.path, {
            folder: "playlist_thumbnails"
        });

        // Delete the file from disk after successful upload
        fs.unlinkSync(file.path);

        playlist.thumbnail.url = result.url;
        playlist.thumbnail.public_id = result.public_id;

        await playlist.save();

        return res.status(200).json({
            success: true,
            message: "Playlist Thumbnail Uploaded Successfully!",
            playlist,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPlaylist API"
        })
    }
}

// deletePlaylistThumbnail
export const deletePlaylistThumbnail = async (req, res) => {
    try {
        const userId = req.user._id;
        const playlistId = req.params.playlistId;

        const playlist = await Playlist.findById(playlistId);

        if (!playlist.thumbnail.public_id) {
            return res.status(400).json({
                success: false,
                message: "No Thumbnail Found!",
            })
        }

        await cloudinary.uploader.destroy(playlist.thumbnail.public_id);

        playlist.thumbnail.url = "";
        playlist.thumbnail.public_id = "";

        await playlist.save();

        return res.status(200).json({
            success: true,
            message: "Playlist Thumbnail Deleted Successfully!",
            playlist,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPlaylist API"
        })
    }
}

// allVideoInPlaylist
export const addVideoInPlaylist = async (req, res) => {
    try {
        const userId = req.user._id;
        const playlistId = req.params.playlistId;
        const videoId = req.params.videoId;


        const playlist = await Playlist.findById(playlistId);
        const video = await Video.findById(videoId);

        if (!playlist) {
            return res.status(400).json({
                success: false,
                message: "Playlist Not Found!",
            });
        }

        if (!video) {
            return res.status(400).json({
                success: false,
                message: "Video Not Found!",
            });
        }

        if (playlist.userId.toString() !== userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are not authorized to add video in this playlist!",
            });
        }

        if (!playlist.videos.includes(videoId)) {
            playlist.videos.push(videoId)

            await playlist.save();

            return res.status(200).json({
                success: true,
                message: "Video added to Playlist!",
                playlist,
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Video already in Playlist!",
            });
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPlaylist API"
        })
    }
}

// deleteVideoFromPlaylist
export const deleteVideoFromPlaylist = async (req, res) => {
    try {
        const userId = req.user._id;
        const playlistId = req.params.playlistId;
        const videoId = req.params.videoId;


        const playlist = await Playlist.findById(playlistId);
        const video = await Video.findById(videoId);

        if (!playlist) {
            return res.status(400).json({
                success: false,
                message: "Playlist Not Found!",
            });
        }

        if (!video) {
            return res.status(400).json({
                success: false,
                message: "Video Not Found!",
            });
        }

        if (playlist.userId.toString() !== userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are not authorized to delete video from this playlist!",
            });
        }

        if (playlist.videos.includes(videoId)) {
            playlist.videos = playlist.videos.filter((vid) => vid.toString() !== videoId.toString())

            await playlist.save();

            return res.status(200).json({
                success: true,
                message: "Video deleted from Playlist!",
                playlist,
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "Video not in Playlist!",
            });
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPlaylist API"
        })
    }
}

// getPlaylistById
export const getPlaylistById = async (req, res) => {
    try {
        const userId = req.user._id;
        const playlistId = req.params.playlistId;

        const playlist = await Playlist.findOne({ _id: playlistId, isDelete: false });


        return res.status(200).json({
            success: true,
            message: "Fetched playlist by Id!",
            playlist,
        });



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPlaylist API"
        })
    }
}

// getAllPlaylistsByUserId
export const getAllPlaylistsByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;

        const playlists = await Playlist.find({ isDelete: false, userId: userId });

        if (!playlists) {
            return res.status(440).json({
                success: false,
                message: "Playlists Not Found for this User!",
            });
        }


        return res.status(200).json({
            success: true,
            message: "Fetched playlist by Id!",
            playlists,
        });



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPlaylist API"
        })
    }
}


