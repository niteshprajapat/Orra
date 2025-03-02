import express from 'express';
import { changeStatus, deleteUserById, getAllDeletedUsers, getAllUsers, getUserById, loginHistory, meProfile, requestEmailUpdate, subscribeUser, unSubscribeUser, updateProfile, verifyEmailUpdate } from '../controllers/user.controller.js';
import { isAdmin, isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();



router.get("/user/:userId", isAuthenticated, getUserById);
router.delete("/user/:userId", isAuthenticated, deleteUserById);
router.get("/me", isAuthenticated, meProfile);
router.put("/user/updateProfile", isAuthenticated, updateProfile);

router.post("/user/request-email-update", isAuthenticated, requestEmailUpdate);
router.post("/user/verify-email-update", verifyEmailUpdate);

// above 2 are pending



router.get("/login-history", isAuthenticated, loginHistory);
router.get("/subscribe-user/:userId", isAuthenticated, subscribeUser);
router.get("/unsubscribe-user/:userId", isAuthenticated, unSubscribeUser);


// Admin Routes
router.get("/getAllUsers", isAuthenticated, isAdmin, getAllUsers);
router.get("/getAllDeletedUsers", isAuthenticated, isAdmin, getAllDeletedUsers);
router.post("/user/change-status/:userId", isAuthenticated, isAdmin, changeStatus);
// router.post("/user/deactive/")




export default router;