import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { createGroupChat, createOneToOneChat, sendMessage } from "../controllers/chat.controller.js";

const router = express.Router();


router.post("/chat/one-to-one", isAuthenticated, createOneToOneChat);
router.post("/chat/group-chat", isAuthenticated, createGroupChat);
router.post("/chat/sendMessage", isAuthenticated, sendMessage);



export default router;