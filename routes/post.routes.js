import express from "express";
import upload from '../middlewares/multer.js';
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { createPost, deletePostById, updatePostById } from "../controllers/post.controller.js";


const router = express.Router();


router.post("/create-post", isAuthenticated, upload.single("image"), createPost);
router.delete("/delete-post/:postId", isAuthenticated, deletePostById);
router.put("/update-post/:postId", isAuthenticated, upload.single("image"), updatePostById);

export default router;