import Chat from "../models/chat.model.js";
import Message from "../models/messageSchema.js";


// createOneToOneChat
export const createOneToOneChat = async (req, res) => {
    try {
        const { participantId } = req.body;
        const userId = req.user._id;

        if (!participantId) {
            return res.status(404).json({
                success: false,
                message: "All fields are required!",
            });
        }


        const existingChat = await Chat.findOne({
            chatType: "one-to-one",
            participants: {
                $all: [userId, participantId],
                $size: 2,
            },
        });

        if (existingChat) {
            return res.status(404).json({
                success: false,
                message: "Chat already exists",
            });
        }

        const chat = await Chat.create({
            chatType: "one-to-one",
            participants: [userId, participantId],
        });

        return res.status(201).json({
            success: true,
            message: "One to One Chat Created Successfully!",
            chat,
        });



    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createOneToOneChat API!",
        });
    }
}


// createGroupChat
export const createGroupChat = async (req, res) => {
    try {
        const { participantIds, groupName } = req.body;
        const userId = req.user._id;

        if (!participantIds || !Array.isArray(participantIds) || participantIds.length < 2) {
            return res.status(400).json({
                success: false,
                message: "At least 2 participantsIds required!",
            });
        }

        if (!groupName || groupName.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "GroupName is required!",
            });
        }

        const chat = await Chat.create({
            chatType: "group",
            participants: [...new Set([userId, ...participantIds])],   // to store unique
            groupName,
            groupAdmin: userId,
        });

        return res.status(201).json({
            success: true,
            message: "Group Chat Created Successfully!",
            chat,
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createOneToOneChat API!",
        });
    }
}

// sendMessage
export const sendMessage = async (req, res) => {
    try {
        const { content, contentType, chatId } = req.body;
        const userId = req.user._id;

        if (!chatId) {
            return res.status(404).json({
                success: false,
                message: "Please provide Chat Id!",
            });
        }

        if (!["text", "image", "file"].includes(contentType)) {
            return res.status(404).json({
                success: false,
                message: "Invalid Content Type!",
            });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat Not Found!",
            });
        }

        if (!chat.participants.includes(userId)) {
            return res.status(404).json({
                success: false,
                message: "You are not authorized to sent message!",
            });
        }

        const message = await Message.create({
            content,
            contentType,
            sender: userId,
            receiver: chat.participants.map((participant) => ({ userId: participant })),
        });

        chat.messages.push(message);
        chat.lastMessageAt = new Date(Date.now());
        await chat.save();

        return res.status(201).json({
            success: true,
            message: "Message Sent Successfully!",
            chat,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in sendMessage API!",
        });
    }
}