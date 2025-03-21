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