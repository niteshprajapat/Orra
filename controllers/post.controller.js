import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import cloudinary from "../config/cloudinary.js";
import fs from 'fs';


// Upload media to Cloudinary
const uploadToCloudinary = (filePath, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
            filePath,
            { folder, resource_type: "auto" },
            (error, result) => {
                if (error) reject(error);
                else {
                    fs.unlinkSync(filePath); // Delete local file after upload
                    resolve(result);
                }
            }
        );
    });
};


// createPost
export const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user._id;
        const file = req.file;

        if (!content) {
            return res.status(404).json({
                success: false,
                message: "All fields are required!",
            });
        }


        let media = {
            url: "",
            public_id: "",
        }

        if (file) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "post_images",
            });

            media.url = result.secure_url;
            media.public_id = result.public_id;
        }


        const post = await Post.create({
            userId: userId,
            content,
            media,
        });


        return res.status(201).json({
            success: true,
            message: "Post Created Successfully!",
            post,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPost API!",
        });
    }
}

// deletePost
export const deletePostById = async (req, res) => {
    try {
        const postId = req.params.postId;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post || post.isDeleted) {
            return res.status(400).json({
                success: false,
                message: "Post Not Found!",
            });
        }

        if (post.userId.toString() !== userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are not authorized to delete this post!",
            });
        }

        if (post.media.public_id) {
            await cloudinary.uploader.destroy(post.media.public_id);
            // post.media.url = "";
            // post.media.public_id = "";
        }

        post.isDeleted = true;
        await post.save();

        return res.status(201).json({
            success: true,
            message: "Post Deleted Successfully!",
            post,
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPost API!",
        });
    }
}

// updatePostById
export const updatePostById = async (req, res) => {
    try {
        const { content } = req.body;
        const postId = req.params.postId;
        const userId = req.user._id;
        const file = req.file;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "All fields are required!",
            });
        }

        const post = await Post.findById(postId);
        if (!post || post.isDeleted) {
            return res.status(400).json({
                success: false,
                message: "Post Not Found!",
            });
        }

        if (post.userId.toString() !== userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You are not authorized to update this post!",
            });
        }

        if (file) {
            if (post.media.public_id) {
                await cloudinary.uploader.destroy(post.media.public_id);
            }

            const result = await cloudinary.uploader.upload(file.path, {
                folder: "post_images",
            });

            post.media.url = result.secure_url;
            post.media.public_id = result.public_id;

        }

        post.content = content;

        await post.save();

        return res.status(201).json({
            success: true,
            message: "Post Updated Successfully!",
            post,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPost API!",
        });
    }
}

// getUserPostsByUserId
export const getUserPostsByUserId = async (req, res) => {
    try {

        const userId = req.params.userId;
        const posts = await Post.find({ userId, isDeleted: false }).sort({ createdAt: -1 });



        return res.status(201).json({
            success: true,
            message: "Fetched User Posts Successfully!",
            posts,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPost API!",
        });
    }
}

// getPostByPostId
export const getPostByPostId = async (req, res) => {
    try {

        const postId = req.params.postId;

        const post = await Post.findById(postId);

        return res.status(201).json({
            success: true,
            message: "Fetched Post by Id Successfully!",
            post,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPost API!",
        });
    }
}

// likeUnlikePostByPostId
export const likeUnlikePostByPostId = async (req, res) => {
    try {

        const postId = req.params.postId;
        const userId = req.user._id;
        const post = await Post.findById(postId);

        if (!post.likes.includes(userId)) {
            await Post.findByIdAndUpdate(
                postId,
                {
                    $push: { likes: userId },
                },
                { new: true },
            );

            return res.status(201).json({
                success: true,
                message: "Post liked Successfully!",
            });
        } else {
            await Post.findByIdAndUpdate(
                postId,
                {
                    $pull: { likes: userId },
                },
                { new: true },
            );

            return res.status(201).json({
                success: true,
                message: "Like removed Successfully!",
            });
        }




    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPost API!",
        });
    }
}



// likeUnlikePostByPostId
export const dislikeRemoveDislikePostByPostId = async (req, res) => {
    try {

        const postId = req.params.postId;
        const userId = req.user._id;
        const post = await Post.findById(postId);

        if (!post.dislikes.includes(userId)) {
            await Post.findByIdAndUpdate(
                postId,
                {
                    $push: { dislikes: userId },
                },
                { new: true },
            );

            return res.status(201).json({
                success: true,
                message: "Post disliked Successfully!",
            });
        } else {
            await Post.findByIdAndUpdate(
                postId,
                {
                    $pull: { dislikes: userId },
                },
                { new: true },
            );

            return res.status(201).json({
                success: true,
                message: "Dislike removed Successfully!",
            });
        }




    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createPost API!",
        });
    }
}