import mongoose, { model } from "mongoose";

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        // required: true
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