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