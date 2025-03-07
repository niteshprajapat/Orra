import express from "express";
import { createVideo, deleteThumbnail, deleteVideoById, dislikeUndislikeVideo, getAllVideos, getAllVideosOfUserByUserId, getRecommendedVideos, getVideoById, getVideosByCategory, increaseVideoView, likeUnlikeVideo, restoreVideoById, searchVideo, trendingVideos, updateVideoDetails, updateVideoUrl, uploadThumbnail } from "../controllers/video.controller.js";
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


// ADMIN Routes


router.get("/get-all-video", isAuthenticated, getAllVideos);


export default router;