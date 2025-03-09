import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { addVideoInPlaylist, changeVisibilityofPlaylistById, createPlaylist, deletePlaylistById, deletePlaylistThumbnail, deleteVideoFromPlaylist, getAllPlaylistsByUserId, getAllPublicPlaylists, getPlaylistById, searchPlaylists, updatePlaylistById, uploadPlaylistThumbnail } from "../controllers/playlist.controller.js";
import upload from '../middlewares/multer.js';

const router = express.Router();


router.post("/create-playlist", isAuthenticated, createPlaylist);
router.post("/upload-playlist-thumbnail/:playlistId", isAuthenticated, upload.single("image"), uploadPlaylistThumbnail);
router.delete("/delete-playlist-thumbnail/:playlistId", isAuthenticated, deletePlaylistThumbnail);

router.put("/add-video-in-playlist/:playlistId/video/:videoId", isAuthenticated, addVideoInPlaylist);
router.delete("/delete-video-from-playlist/:playlistId/video/:videoId", isAuthenticated, deleteVideoFromPlaylist);
router.get("/get-playlist-by-id/:playlistId", isAuthenticated, getPlaylistById);
router.get("/get-all-playlist/:userId", isAuthenticated, getAllPlaylistsByUserId);
router.get("/get-all-public-playlist", isAuthenticated, getAllPublicPlaylists);

router.delete("/delete-playlist/:playlistId", isAuthenticated, deletePlaylistById);

router.put("/change-visibility-of-playlist/:playlistId", isAuthenticated, changeVisibilityofPlaylistById);
router.put("/update-playlist/:playlistId", isAuthenticated, updatePlaylistById);

// searchPlaylists
router.get("/search-public", isAuthenticated, searchPlaylists);



export default router;