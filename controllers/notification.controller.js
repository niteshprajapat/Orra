import Notification from "../models/notification.model.js";


// getAllAdminNotifications
export const getAllAdminNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({}).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Fetched all Notifications",
            total: notifications.length,
            notifications,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getAllAdminNotifications API",
        })
    }
}

// getAllUserNotifications
export const getAllUserNotifications = async (req, res) => {
    try {

        const userId = req.user._id;
        const notifications = await Notification.find({ receiver: userId, isDeleted: false }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Fetched all User Notifications",
            total: notifications.length,
            notifications,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getAllAdminNotifications API",
        })
    }
}

// getAllUnreadUserNotifications
export const getAllUnreadUserNotifications = async (req, res) => {
    try {

        const userId = req.user._id;
        const notifications = await Notification.find({ receiver: userId, isDeleted: false, isRead: false }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Fetched all User unread Notifications",
            total: notifications.length,
            notifications,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getAllAdminNotifications API",
        })
    }
}

// markNotificationAsRead
export const markNotificationAsRead = async (req, res) => {
    try {

        const userId = req.user._id;
        const notificationId = req.params.notificationId;

        if (!notificationId) {
            return res.status(404).json({
                success: false,
                message: "NotificationId Not Found!",
            });
        }

        const notification = await Notification.findOne({ receiver: userId, isDeleted: false });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification Not Found!",
            });
        }

        notification.isRead = true;

        await notification.save();

        return res.status(200).json({
            success: true,
            message: "Marked Notification as Read!",
            notification,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getAllAdminNotifications API",
        })
    }
}

// markAllNotificationAsRead
export const markAllNotificationAsRead = async (req, res) => {
    try {

        const userId = req.user._id;


        await Notification.updateMany(
            { receiver: userId, isRead: false, isDeleted: false },
            {
                $set: { isRead: true }
            },
        );




        return res.status(200).json({
            success: true,
            message: "Marked All Notification as Read!",
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getAllAdminNotifications API",
        })
    }
}

// deleteAllNotification
export const deleteAllNotification = async (req, res) => {
    try {

        const userId = req.user._id;


        await Notification.updateMany(
            { receiver: userId, isDeleted: false },
            {
                $set: { isDeleted: true }
            },
        );

        return res.status(200).json({
            success: true,
            message: "Deleted All Notification!",
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getAllAdminNotifications API",
        })
    }
}

// deleteAllNotification
export const deleteNotificationById = async (req, res) => {
    try {

        const userId = req.user._id;
        const notificationId = req.params.notificationId;

        const notification = await Notification.findById(notificationId);

        notification.isDeleted = true;
        await notification.save();

        return res.status(200).json({
            success: true,
            message: "Deleted Notification!",
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getAllAdminNotifications API",
        })
    }
}

// getNotificationByType
export const getNotificationByType = async (req, res) => {
    try {

        const userId = req.user._id;
        const type = req.params.type;

        const notifications = await Notification.find({
            type: type,
            isDeleted: false,
        }).sort({ createdAt: -1 });


        return res.status(200).json({
            success: true,
            message: "Get Notification by Type!",
            total: notifications.length,
            notifications,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in getAllAdminNotifications API",
        })
    }
}