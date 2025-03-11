import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { getAllAdminNotifications, getAllUserNotifications, markNotificationAsRead } from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/get-all-admin-notifications", isAuthenticated, isAdmin, getAllAdminNotifications);
router.get("/get-all-user-notifications", isAuthenticated, getAllUserNotifications);
router.get("/mark-as-read-notification/:notificationId", isAuthenticated, markNotificationAsRead);


export default router;