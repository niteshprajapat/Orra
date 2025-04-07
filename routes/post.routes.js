import express from "express";
import upload from '../middlewares/multer.js';
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { createPost, deletePostById, dislikeRemoveDislikePostByPostId, getPostByPostId, getUserPostsByUserId, likeUnlikePostByPostId, updatePostById } from "../controllers/post.controller.js";


const router = express.Router();


router.post("/create-post", isAuthenticated, upload.single("image"), createPost);
router.delete("/delete-post/:postId", isAuthenticated, deletePostById);
router.put("/update-post/:postId", isAuthenticated, upload.single("image"), updatePostById);

router.get("/user-posts/:userId", isAuthenticated, getUserPostsByUserId);
router.get("/get-post/:postId", isAuthenticated, getPostByPostId);

router.get("/like-removelike-post/:postId", isAuthenticated, likeUnlikePostByPostId);
router.get("/dislike-removedislike-post/:postId", isAuthenticated, dislikeRemoveDislikePostByPostId);

// router.post("/create-comment/:postId", isAuthenticated, createCommentOnPost);

export default router;