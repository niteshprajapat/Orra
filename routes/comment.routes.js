import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { deleteAllNotification, deleteNotificationById, getAllAdminNotifications, getAllUnreadUserNotifications, getAllUserNotifications, getNotificationByType, markAllNotificationAsRead, markNotificationAsRead } from "../controllers/notification.controller.js";
import { createComment } from "../controllers/comment.controller.js";

const router = express.Router();


router.post("/create-comment/:videoId", isAuthenticated, createComment);

export default router;