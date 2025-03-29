import express from 'express';
import { bulkChangeUserStatus, changeStatus, deleteCoverImage, deleteProfilePhoto, deleteUserById, forceDeleteUserByUserId, getAllDeletedUsers, getAllUsers, getListofSubscribedTo, getListofSubscribers, getUserById, loginHistory, meProfile, requestEmailUpdate, subscribeUser, unSubscribeUser, updateProfile, uploadCoverImage, uploadProfilePhoto, verifyEmailUpdate } from '../controllers/user.controller.js';
import { isAdmin, isAuthenticated } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multer.js';

const router = express.Router();



router.get("/user/:userId", isAuthenticated, getUserById);
router.delete("/user/:userId", isAuthenticated, deleteUserById);
router.get("/me", isAuthenticated, meProfile);
router.put("/user/updateProfile", isAuthenticated, updateProfile);

router.post("/user/request-email-update", isAuthenticated, requestEmailUpdate);
router.post("/user/verify-email-update", verifyEmailUpdate);


router.get("/login-history", isAuthenticated, loginHistory);
router.get("/subscribe-user/:userId", isAuthenticated, subscribeUser);
router.get("/unsubscribe-user/:userId", isAuthenticated, unSubscribeUser);
router.get("/all-subscribers/:userId", isAuthenticated, getListofSubscribers);
router.get("/all-subscribedTo/:userId", isAuthenticated, getListofSubscribedTo);

// Picture
router.post("/upload-profile-picture", isAuthenticated, upload.single("image"), uploadProfilePhoto);
router.delete("/delete-profile-picture", isAuthenticated, deleteProfilePhoto);
router.post("/upload-cover-image", isAuthenticated, upload.single("image"), uploadCoverImage);
router.delete("/delete-cover-image", isAuthenticated, deleteCoverImage);



// Admin Routes
router.get("/getAllUsers", isAuthenticated, isAdmin, getAllUsers);
router.get("/getAllDeletedUsers", isAuthenticated, isAdmin, getAllDeletedUsers);
router.post("/user/change-status/:userId", isAuthenticated, isAdmin, changeStatus);
// router.post("/user/deactive/")

router.delete("/admin/force-delete-user/:userId", isAuthenticated, isAdmin, forceDeleteUserByUserId);
router.put("/admin/bulk-change-status", isAuthenticated, isAdmin, bulkChangeUserStatus);




export default router;