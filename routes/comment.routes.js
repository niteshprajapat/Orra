import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { deleteAllNotification, deleteNotificationById, getAllAdminNotifications, getAllUnreadUserNotifications, getAllUserNotifications, getNotificationByType, markAllNotificationAsRead, markNotificationAsRead } from "../controllers/notification.controller.js";
import { createComment, deleteCommentByCommentId, getCommentByCommentId, getCommentByVideoId, updateCommentByCommentId } from "../controllers/comment.controller.js";

const router = express.Router();


router.post("/create-comment/:videoId", isAuthenticated, createComment);
router.get("/get-comments/:videoId", isAuthenticated, getCommentByVideoId);
router.get("/get-comment/:commentId", isAuthenticated, getCommentByCommentId);
router.put("/update-comment/:commentId", isAuthenticated, updateCommentByCommentId);
router.delete("/delete-comment/:commentId", isAuthenticated, deleteCommentByCommentId);

export default router;