import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { startLiveStream } from "../controllers/liveStream.controller.js";
import upload from '../middlewares/multer.js';

const router = express.Router();



router.post("/start-live-stream", isAuthenticated, upload.single("file"), startLiveStream);

export default router;