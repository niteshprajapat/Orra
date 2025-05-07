import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { endLiveStream, startLiveStream } from "../controllers/liveStream.controller.js";
import upload from '../middlewares/multer.js';

const router = express.Router();



router.post("/start-live-stream", isAuthenticated, upload.single("file"), startLiveStream);
router.get("/end-live-stream", isAuthenticated, endLiveStream);
router.get("get-active-live-stream", isAuthenticated, getActiveLiveStreams);

export default router;