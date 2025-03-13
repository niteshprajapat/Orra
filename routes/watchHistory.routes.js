import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { getUserWatchHistory } from "../controllers/watchHistory.controller.js";

const router = express.Router();

router.get("/get-user-watch-history", isAuthenticated, getUserWatchHistory);

export default router;