import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { clearWatchHistory, getUserWatchHistory, removeFromWatchHistory } from "../controllers/watchHistory.controller.js";

const router = express.Router();

router.get("/get-user-watch-history", isAuthenticated, getUserWatchHistory);
router.delete("/clear-watch-history", isAuthenticated, clearWatchHistory);
router.delete("/remove-from-watch-history/:videoId", isAuthenticated, removeFromWatchHistory);

export default router;