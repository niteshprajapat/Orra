import Comment from '../models/comment.model.js';
import Video from '../models/video.model.js';


// createComment
export const createComment = async (req, res) => {
    try {
        const { content } = req.body;
        const videoId = req.params.videoId;
        const userId = req.user._id;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "All fields are Required!",
            });
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video Not Found!",
            });
        }

        const comment = await Comment.create({
            userId,
            videoId,
            content,
        });

        if (comment) {
            video.comments.push(comment._id);
            await video.save();
        }

        return res.status(201).json({
            success: true,
            message: "Comment Created Successfully!",
            comment,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createComment API!"
        });
    }
}

// getCommentByVideoId
export const getCommentByVideoId = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const userId = req.user._id;


        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video Not Found!",
            });
        }

        const comments = await Comment.find({ videoId }).populate({
            path: "userId",
            select: "fullname username profilePicture.url"
        });

        return res.status(201).json({
            success: true,
            message: "Fetched all Comments by VideoId Successfully!",
            total: comments.length,
            comments,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createComment API!"
        });
    }
}

// getCommentByCommentId
export const getCommentByCommentId = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: "Comment Not Found by Id",
            });
        }

        return res.status(201).json({
            success: true,
            message: "Fetched Comment Successfully!",
            comment,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createComment API!"
        });
    }
}

// updateCommentByCommentId
export const updateCommentByCommentId = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user._id;
        const { content } = req.body;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: "Comment Not Found by Id",
            });
        }

        if (comment.userId.toString() !== userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cant update this comment!",
            });
        }

        comment.content = content;
        comment.editedAt = new Date(Date.now());
        await comment.save();

        return res.status(201).json({
            success: true,
            message: "Comment Updated Successfully!",
            comment,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createComment API!"
        });
    }
}

// deleteCommentByCommentId
export const deleteCommentByCommentId = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(400).json({
                success: false,
                message: "Comment Not Found by Id",
            });
        }

        if (comment.userId.toString() !== userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cant delete this comment!",
            });
        }


        comment.isDelete = true;
        await comment.save();

        return res.status(200).json({
            success: true,
            message: "Comment Deleted Successfully!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createComment API!"
        });
    }
}

// likeUnlikeCommentByCommentId
export const likeUnlikeCommentByCommentId = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment Not Found!",
            });
        }

        if (!comment.likes.includes(userId)) {
            // like 

            await Comment.findByIdAndUpdate(
                commentId,
                {
                    $push: { likes: userId },
                },
                {
                    new: true,
                }
            );

            return res.status(200).json({
                success: true,
                message: "Comment liked Successfully!",
            });

        } else {
            // unlike

            await Comment.findByIdAndUpdate(
                commentId,
                {
                    $pull: { likes: userId },
                },
                {
                    new: true,
                }
            );

            return res.status(200).json({
                success: true,
                message: "Comment Unliked Successfully!",
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createComment API!"
        });
    }
}

// dislikeUndislikeCommentByCommentId
export const dislikeUndislikeCommentByCommentId = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.user._id;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment Not Found!",
            });
        }

        if (!comment.dislikes.includes(userId)) {
            // dislike 

            await Comment.findByIdAndUpdate(
                commentId,
                {
                    $push: { dislikes: userId },
                },
                {
                    new: true,
                }
            );

            return res.status(200).json({
                success: true,
                message: "Comment disliked Successfully!",
            });

        } else {
            // undislike

            await Comment.findByIdAndUpdate(
                commentId,
                {
                    $pull: { dislikes: userId },
                },
                {
                    new: true,
                }
            );

            return res.status(200).json({
                success: true,
                message: "Comment Undisliked Successfully!",
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createComment API!"
        });
    }
}

// getAllCommentsByUser
export const getAllCommentsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: "UserId Not Found!"
            })
        }

        const comments = await Comment.find({ userId, isDelete: false }).populate({
            path: "videoId",
            select: "title thumbnail.url"
        })
        if (!comments) {
            return res.status(404).json({
                success: false,
                message: "Comments Not Found!",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Fetched All Comments by UserId Successfully!",
            comments,
        });



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createComment API!"
        });
    }
}