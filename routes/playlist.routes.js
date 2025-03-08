import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { addVideoInPlaylist, createPlaylist, deletePlaylistThumbnail, deleteVideoFromPlaylist, getAllPlaylistsByUserId, getPlaylistById, uploadPlaylistThumbnail } from "../controllers/playlist.controller.js";
import upload from '../middlewares/multer.js';

const router = express.Router();


router.post("/create-playlist", isAuthenticated, createPlaylist);
router.post("/upload-playlist-thumbnail/:playlistId", isAuthenticated, upload.single("image"), uploadPlaylistThumbnail);
router.delete("/delete-playlist-thumbnail/:playlistId", isAuthenticated, deletePlaylistThumbnail);

router.put("/add-video-in-playlist/:playlistId/video/:videoId", isAuthenticated, addVideoInPlaylist);
router.delete("/delete-video-from-playlist/:playlistId/video/:videoId", isAuthenticated, deleteVideoFromPlaylist);
router.get("/get-playlist-by-id/:playlistId", isAuthenticated, getPlaylistById);
router.get("/get-all-playlist/:userId", isAuthenticated, getAllPlaylistsByUserId);




export default router;