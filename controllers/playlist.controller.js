import Playlist from "../models/playlist.model.js";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
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
            return res.status(404).json({
                success: false,
                message: "Playlists Not Found for this User!",
            });
        }


        return res.status(200).json({
            success: true,
            message: "Fetched all playlists of User!",
            total: playlists.length,
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

// getAllPublicPlaylists
export const getAllPublicPlaylists = async (req, res) => {
    try {

        const playlists = await Playlist.find({ visibility: "public" }).sort({ createdAt: -1 });

        if (!playlists) {
            return res.status(404).json({
                success: false,
                message: "Playlists Not Found for this User!",
            });
        }


        return res.status(200).json({
            success: true,
            message: "Fetched all public playlists!",
            total: playlists.length,
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

// export const getAllPublicPlaylists = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

//         const skip = (page - 1) * limit;

//         // Fetch public playlists with pagination & sorting
//         const playlists = await Playlist.find({ visibility: "public" })
//             .sort({ [sortBy]: order === "asc" ? 1 : -1 }) // Sorting
//             .skip(skip) // Pagination: Skip previous pages
//             .limit(parseInt(limit)); // Limit per page

//         // Get total count for pagination info
//         const totalPlaylists = await Playlist.countDocuments({ visibility: "public" });

//         return res.status(200).json({
//             success: true,
//             message: "Fetched all public playlists!",
//             totalPlaylists,
//             currentPage: parseInt(page),
//             totalPages: Math.ceil(totalPlaylists / limit),
//             playlists,
//         });

//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             success: false,
//             message: "Error fetching public playlists!",
//         });
//     }
// };



// deletePlaylistById
export const deletePlaylistById = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;

        if (!playlistId) {
            return res.status(404).json({
                success: false,
                message: "PlaylistId is Required!",
            });
        }

        const playlist = await Playlist.findOne({ _id: playlistId, isDelete: false });

        playlist.isDelete = true;

        await playlist.save();

        return res.status(200).json({
            success: true,
            message: "Playlist Deleted Successfully!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPlaylist API"
        })
    }
}

// changeVisibilityofPlaylistById
export const changeVisibilityofPlaylistById = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const { visibility } = req.body;


        if (!playlistId || !visibility) {
            return res.status(404).json({
                success: false,
                message: "All fields are Required!",
            });
        }


        const playlist = await Playlist.findById(playlistId);

        if (playlist.visibility) {
            playlist.visibility = visibility;
        }

        await playlist.save();

        return res.status(200).json({
            success: true,
            message: "Playlist Visibility Changed Successfully!",
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


// updatePlaylistById
export const updatePlaylistById = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const { title } = req.body;


        if (!playlistId) {
            return res.status(404).json({
                success: false,
                message: "All fields are Required!",
            });
        }


        const playlist = await Playlist.findById(playlistId);

        if (playlist.title) {
            playlist.title = title;
        }

        await playlist.save();

        return res.status(200).json({
            success: true,
            message: "Playlist Updated Successfully!",
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

// searchPlaylists
export const searchPlaylists = async (req, res) => {
    try {
        const { query, page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;
        const skip = (page - 1) * limit;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required!",
            });
        }

        const searchQuery = {
            $or: [
                { title: { $regex: query, $options: "i" } },
            ]
        }

        // if (query.match(/^[0-9a-fA-F]{24}$/)) {
        //     searchQuery.$or.push({ userId: query })
        // } else {
        //     const users = await User.find({ username: { $regex: query, $options: "i" } }).select("_id");

        //     if (users.length > 0) {
        //         searchQuery.$or.push({ userId: { $in: users.map(user => user._id) } });
        //     }
        // }

        // Search for users with matching username
        const users = await User.find({ username: { $regex: query, $options: "i" } }).select("_id");

        if (users.length > 0) {
            searchQuery = { $or: [{ title: { $regex: query, $options: "i" } }, { userId: { $in: users.map(user => user._id) } }] };
        }

        const playlists = await Playlist.find(searchQuery)
            .sort({ [sortBy]: order === "asc" ? 1 : -1 }) // Sorting
            .skip(skip) // Pagination
            .limit(parseInt(limit));


        return res.status(200).json({
            success: true,
            message: "Search results for playlists",
            total: playlists.length,
            currentPage: parseInt(page),
            totalPages: Math.ceil(playlists.length / limit),
            playlists,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in searchPlaylists API"
        })
    }
}


