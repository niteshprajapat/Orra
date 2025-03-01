import express from 'express';
import { changeStatus, deleteUserById, getAllDeletedUsers, getAllUsers, getUserById, loginHistory, meProfile, updateProfile } from '../controllers/user.controller.js';
import { isAdmin, isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();



router.get("/user/:userId", isAuthenticated, getUserById);
router.delete("/user/:userId", isAuthenticated, deleteUserById);
router.get("/me", isAuthenticated, meProfile);
router.put("/user/updateProfile", isAuthenticated, updateProfile);

router.get("/login-history", isAuthenticated, loginHistory);


// Admin Routes
router.get("/getAllUsers", isAuthenticated, isAdmin, getAllUsers);
router.get("/getAllDeletedUsers", isAuthenticated, isAdmin, getAllDeletedUsers);
router.post("/user/change-status/:userId", isAuthenticated, isAdmin, changeStatus);




export default router;