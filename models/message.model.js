import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content: {
        url: {
            type: String,
            required: true // URL ya text yahan jayega
        },
        public_id: {
            type: String, // Cloudinary public_id for deletion
            default: ""
        }
    },
    contentType: {
        type: String,
        enum: ["text", "image", "file"],
        default: "text"
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            readAt: {
                type: Date,
                default: null,
            }
        },
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    },



}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;