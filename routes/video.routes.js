import express from "express";
import { createVideo, deleteThumbnail, getAllVideos, getAllVideosOfUserByUserId, updateVideoDetails, updateVideoUrl, uploadThumbnail } from "../controllers/video.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import upload from '../middlewares/multer.js';


const router = express.Router();




router.post("/create-video", isAuthenticated, upload.single("video"), createVideo);
router.post("/upload-thumbnail/:videoId", isAuthenticated, upload.single("image"), uploadThumbnail);
router.delete("/delete-thumbnail/:videoId", isAuthenticated, deleteThumbnail);

router.put("/update-videoUrl/:videoId", isAuthenticated, upload.single("video"), updateVideoUrl);
router.put("/update-video-details/:videoId", isAuthenticated, updateVideoDetails);


router.get("/get-all-videos-of-user/:userId", isAuthenticated, getAllVideosOfUserByUserId);


// ADMIN Routes


router.get("/get-all-video", isAuthenticated, getAllVideos);


export default router;