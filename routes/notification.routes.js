import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { deleteAllNotification, deleteNotificationById, getAllAdminNotifications, getAllUnreadUserNotifications, getAllUserNotifications, getNotificationByType, markAllNotificationAsRead, markNotificationAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/get-all-admin-notifications", isAuthenticated, isAdmin, getAllAdminNotifications);
router.get("/get-all-user-notifications", isAuthenticated, getAllUserNotifications);
router.get("/get-all-unread-user-notifications", isAuthenticated, getAllUnreadUserNotifications);
router.get("/mark-as-read-notification/:notificationId", isAuthenticated, markNotificationAsRead);
router.get("/mark-all-notification-as-read", isAuthenticated, markAllNotificationAsRead);

router.delete("/delete-all-notification", isAuthenticated, deleteAllNotification);  //  soft delete
router.delete("/delete-notification/:notificationId", isAuthenticated, deleteNotificationById); //  soft delete

router.get("/get-notifications-by-type/:type", isAuthenticated, getNotificationByType);

export default router;