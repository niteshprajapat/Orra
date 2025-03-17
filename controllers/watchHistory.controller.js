import WatchHistory from "../models/watchHistory.model.js";



// getUserWatchHistory
export const getUserWatchHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const userWatchHistory = await WatchHistory.findOne({ userId }).lean();

        if (!userWatchHistory) {
            return res.status(404).json({
                success: false,
                message: "Watched History Not Found!",
            });
        }


        const filteredVideos = userWatchHistory.videos.filter((video) => !video.isDeleted);


        return res.status(200).json({
            success: true,
            message: "User Watch History!",
            total: filteredVideos.length,
            userWatchHistory: {
                ...userWatchHistory,
                videos: filteredVideos,
            },
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}

// clearWatchHistory
export const clearWatchHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const userWatchHistory = await WatchHistory.findOne({ userId: userId });

        if (!userWatchHistory) {
            return res.status(404).json({
                success: false,
                message: "Watch history not found.",
            });
        }

        userWatchHistory.videos = [];

        await userWatchHistory.save();

        return res.status(200).json({
            success: true,
            message: "Watch history cleared successfully.",
        });



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}
// removeFromWatchHistory
export const removeFromWatchHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const videoId = req.params.videoId;

        const userWatchHistory = await WatchHistory.findOne({ userId: userId });

        if (!userWatchHistory) {
            return res.status(404).json({
                success: false,
                message: "Watch history not found.",
            });
        }



        const videoIndex = userWatchHistory.videos.findIndex((video) => video.videoId.toString() === videoId.toString());

        if (videoIndex !== -1) {
            userWatchHistory.videos[videoIndex].isDeleted = true;
            await userWatchHistory.save();
        }

        await userWatchHistory.save();

        return res.status(200).json({
            success: true,
            message: "Video removed from watch history.",
        });



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in deleteThumbnail API!",
        });
    }
}