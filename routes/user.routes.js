import express from 'express';
import { deleteUserById, getAllDeletedUsers, getAllUsers, getUserById } from '../controllers/user.controller.js';
import { isAdmin, isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();



router.get("/user/:userId", isAuthenticated, getUserById);
router.delete("/user/:userId", isAuthenticated, deleteUserById);


// Admin Routes
router.get("/getAllUsers", isAuthenticated, isAdmin, getAllUsers);
router.get("/getAllDeletedUsers", isAuthenticated, isAdmin, getAllDeletedUsers);




export default router;