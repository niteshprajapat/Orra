import mongoose, { model } from "mongoose";

const chatSchema = new mongoose.Schema({
    chatType: {
        type: String,
        enum: ["one-to-one", "group"],
        default: "one-to-one"
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        }
    ],
    groupName: {
        type: String,
        required: function () {
            return this.chatType === "group";
        },
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: function () {
            return this.chatType === "group";
        },
    },
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false,
    },
    lastMessageAt: {
        type: Date,
        default: null,
    }



}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;