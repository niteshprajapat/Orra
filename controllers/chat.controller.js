import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";


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

// getChatMessages
export const getChatMessages = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const userId = req.user._id;

        if (!chatId) {
            return res.status(404).json({
                success: false,
                message: "Please provide Chat Id!",
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
            return res.status(403).json({
                success: false,
                message: "You are not authorized!",
            });
        }

        const messages = await Message.find({ _id: { $in: chat.messages } }).populate({
            path: "sender",
            select: "username",
        }).sort({ createdAt: -1 });

        return res.status(201).json({
            success: true,
            message: "Message Sent Successfully!",
            messages,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in sendMessage API!",
        });
    }
}


// markMessageRead
export const markMessageRead = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const userId = req.user._id;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                message: "Message ID is required!",
            });
        }

        const message = await Message.findById(messageId);

        const receiver = message.receiver.find((r) => (r.userId.toString() === userId.toString()));

        if (!receiver) {
            return res.status(400).json({
                success: false,
                message: "Not a Received!",
            });
        }


        if (receiver.readAt) {
            return res.status(400).json({
                success: false,
                message: "Message already read!",
            });
        }

        receiver.readAt = new Date(Date.now());
        await message.save();

        return res.status(200).json({
            success: true,
            message: "Message marked as read!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in sendMessage API!",
        });
    }
}



// addParticipantToGroup
export const addParticipantToGroup = async (req, res) => {
    try {
        const { participantId, chatId } = req.body;
        const userId = req.user._id;

        if (!participantId) {
            return res.status(400).json({
                success: false,
                message: "ParticipantsId is required!",
            });
        }

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "ChatId is required!",
            });
        }

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat Not Found!",
            });
        }

        if (chat.chatType !== "group") {
            return res.status(400).json({
                success: false,
                message: "Not a Group Chat!"
            });
        }

        if (chat.groupAdmin.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only admin's can add participants!",
            })
        }

        if (chat.participants.includes(participantId)) {
            return res.status(400).json({
                success: false,
                message: "User already in group!",
            })
        }

        chat.participants.push(participantId);
        await chat.save();


        return res.status(201).json({
            success: true,
            message: "User added to Group Chat Successfully!",
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

// deleteGroupChat
export const deleteGroupChat = async (req, res) => {
    try {
        const { chatId } = req.body;
        const userId = req.user._id;

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "ChatId is required!",
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
            return res.status(400).json({
                success: false,
                message: "You are not authorized!",
            });
        }

        if (chat.chatType === "group" && chat.groupAdmin.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only admin can delete group!",
            });
        }

        chat.isDeleted = true;
        await chat.save();


        return res.status(201).json({
            success: true,
            message: "Chat deleted Successfully!",
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createOneToOneChat API!",
        });
    }
}


// deleteMessage
export const deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.messageId;
        const userId = req.user._id;

        const message = await Message.findOne({ _id: messageId, isDeleted: false });

        if (message.sender.toString() !== userId.toString()) {
            return res.status(400).json({
                success: true,
                message: "You are not authorized to delete this message!",
            });
        }

        message.isDeleted = true;
        await message.save();


        return res.status(201).json({
            success: true,
            message: "Message deleted Successfully!",
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createOneToOneChat API!",
        });
    }
}

// deleteOneToOneChat
export const deleteOneToOneChat = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const userId = req.user._id;

        const chat = await Chat.find({ _id: chatId, isDeleted: false });

        console.log("CHAT => ", chat);

        if (chat.chatType !== "one-to-one") {
            return res.status(400).json({
                success: false,
                message: "Not a one-to-one chat!",
            });
        }

        if (!chat.participants.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "Not authorized!",
            });
        }

        chat.isDeleted = true;
        await chat.save();

        return res.status(201).json({
            success: true,
            message: "One-To-One Chat deleted Successfully!",
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createOneToOneChat API!",
        });
    }
}


// removeUserFromGroup 
export const removeUserFromGroup = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const { removeUserId } = req.body;
        const userId = req.user._id;

        const chat = await Chat.findOne({ _id: chatId, isDeleted: false });

        if (chat.chatType !== "group") {
            return res.status(400).json({
                success: false,
                message: "Not a group chat"
            });
        }

        if (chat.groupAdmin.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to remove user from Chat!",
            });
        }

        if (!chat.participants.includes(removeUserId)) {
            return res.status(404).json({
                success: false,
                message: "User not in Group!",
            });
        }

        if (chat.groupAdmin.toString() !== removeUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Cannot remove group admin!",
            });
        }

        chat.participants = chat.participants.filter((p) => (p.toString() !== removeUserId.toString()))
        await chat.save();


        return res.status(200).json({
            success: true,
            message: "User Removed from Group!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createOneToOneChat API!",
        });
    }
}

// leaveGroupChat
export const leaveGroupChat = async (req, res) => {
    try {
        const chatId = req.params.chatId;
        const userId = req.user._id;

        if (!chatId) {
            return res.status(400).json({
                success: false,
                message: "Chat ID is required!",
            });
        }

        const chat = await Chat.findById(chatId);
        if (!chat || chat.isDeleted) {
            return res.status(400).json({
                success: true,
                message: "Chat Not Found!",
            });
        }

        if (chat.chatType !== "group") {
            return res.status(400).json({
                success: true,
                message: "Not a Group Chat!",
            });
        }

        if (!chat.participants.includes(userId)) {
            return res.status(400).json({
                success: true,
                message: "Not in a Group!",
            });
        }

        if (chat.groupAdmin.toString() === userId.toString()) {
            return res.status(400).json({
                success: true,
                message: "Admin cannot leave, delete group instead!",
            });
        }

        chat.participants = chat.participants.filter((id) => (id.toString() !== userId.toString()));
        await chat.save();

        return res.status(200).json({
            success: true,
            message: "User Left group chat!",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in leaveGroupChat API!",
        });
    }
}
