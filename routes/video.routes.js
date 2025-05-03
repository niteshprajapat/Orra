import express from "express";
import { banVideoByVideoId, changeVisibilityOfVideoByVideoId, createVideo, deleteThumbnail, deleteVideoById, dislikeUndislikeVideo, getAllDeletedVideos, getAllReportedVideos, getAllVideos, getAllVideosOfUserByUserId, getRecommendedVideos, getTrendingVideosStats, getVideoAnalytics, getVideoById, getVideosByCategory, getVideosStats, increaseVideoView, likeUnlikeVideo, reportVideoById, restoreVideoById, searchVideo, trendingVideos, unbanVideoByVideoId, updateVideoDetails, updateVideoUrl, uploadThumbnail } from "../controllers/video.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import upload from '../middlewares/multer.js';


const router = express.Router();




router.post("/create-video", isAuthenticated, upload.single("video"), createVideo);
router.post("/upload-thumbnail/:videoId", isAuthenticated, upload.single("image"), uploadThumbnail);
router.delete("/delete-thumbnail/:videoId", isAuthenticated, deleteThumbnail);

router.put("/update-videoUrl/:videoId", isAuthenticated, upload.single("video"), updateVideoUrl);
router.put("/update-video-details/:videoId", isAuthenticated, updateVideoDetails);
router.delete("/delete-video/:videoId", isAuthenticated, deleteVideoById);
router.put("/restore-video/:videoId", isAuthenticated, restoreVideoById);
router.get("/get-video/:videoId", isAuthenticated, getVideoById);
router.get("/view-video/:videoId", isAuthenticated, increaseVideoView);
router.get("/trending-videos", isAuthenticated, trendingVideos);
router.get("/category-videos/:category", isAuthenticated, getVideosByCategory);
router.get("/like-unlike-video/:videoId", isAuthenticated, likeUnlikeVideo);
router.get("/dislike-undislike-video/:videoId", isAuthenticated, dislikeUndislikeVideo);

router.get("/search-video", isAuthenticated, searchVideo);
router.get("/recommended/:videoId", isAuthenticated, getRecommendedVideos);


router.get("/get-all-videos-of-user/:userId", isAuthenticated, getAllVideosOfUserByUserId);
router.put("/change-visibility-of-video/:videoId", isAuthenticated, changeVisibilityOfVideoByVideoId);


// report video
router.post("/report-video/:videoId", isAuthenticated, reportVideoById);

// ADMIN Routes

router.get("/admin/get-all-video", isAuthenticated, isAdmin, getAllVideos);
router.get("/admin/get-all-deleted-videos", isAuthenticated, isAdmin, getAllDeletedVideos);
router.get("/admin/get-all-reported-videos", isAuthenticated, isAdmin, getAllReportedVideos);
router.get("/admin/get-all-reported-videos", isAuthenticated, isAdmin, getAllReportedVideos);
router.get("/admin/ban-video/:videoId", isAuthenticated, isAdmin, banVideoByVideoId);
router.get("/admin/unban-video/:videoId", isAuthenticated, isAdmin, unbanVideoByVideoId);

router.get("/video/:videoId/analytics", isAuthenticated, getVideoAnalytics);
router.get("/admin/stats/videos", isAuthenticated, isAdmin, getVideosStats)
router.get("/admin/stats/trending-videos-stats", isAuthenticated, isAdmin, getTrendingVideosStats)



export default router;