import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import {
    addParticipantToGroup,
    createGroupChat,
    createOneToOneChat,
    deleteGroupChat,
    deleteMessage,
    deleteOneToOneChat,
    editMessage,
    getChatMessages,
    leaveGroupChat,
    markMessageRead,
    removeUserFromGroup,
    sendMessage,
    getUserChats,
    getChatDetails,
    getUnreadMessages,
    markAllMessagesRead,
    forwardMessage,
    updateGroupChat,
    changeGroupAdmin,
    getGroupMembers,
    getChatMedia,
    deleteFile,
    searchMessages,
    filterChats,
    pinMessage,
    unpinMessage,
    muteChat,
    unmuteChat,
    blockChat
} from "../controllers/chat.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Chat Creation
router.post("/chat/one-to-one", isAuthenticated, createOneToOneChat);
router.post("/chat/group-chat", isAuthenticated, createGroupChat);

// Messaging
router.post("/chat/sendMessage", isAuthenticated, upload.single("file"), sendMessage);
router.get("/chat/getChatMessages/:chatId", isAuthenticated, getChatMessages);
router.put("/chat/message-read/:messageId", isAuthenticated, markMessageRead); // Changed to PUT
router.put("/chat/edit-message/:messageId", isAuthenticated, editMessage);
router.delete("/chat/delete-message/:messageId", isAuthenticated, deleteMessage);
router.get("/chat/unread-messages", isAuthenticated, getUnreadMessages);
router.put("/chat/mark-all-read/:chatId", isAuthenticated, markAllMessagesRead);
router.post("/chat/forward-message", isAuthenticated, forwardMessage);

// Chat Management
router.put("/chat/group/add", isAuthenticated, addParticipantToGroup);
router.delete("/chat/delete-group-chat/:chatId", isAuthenticated, deleteGroupChat);
router.delete("/chat/delete-one-to-one-chat/:chatId", isAuthenticated, deleteOneToOneChat);
router.delete("/chat/group/remove-user/:chatId", isAuthenticated, removeUserFromGroup);
router.put("/chat/group/leave/:chatId", isAuthenticated, leaveGroupChat);
router.put("/chat/group/update/:chatId", isAuthenticated, updateGroupChat);
router.put("/chat/group/change-admin/:chatId", isAuthenticated, changeGroupAdmin);

// Chat Info
router.get("/chat/user-chats", isAuthenticated, getUserChats);
router.get("/chat/details/:chatId", isAuthenticated, getChatDetails);
router.get("/chat/group/members/:chatId", isAuthenticated, getGroupMembers);

// Media Management
router.get("/chat/media/:chatId", isAuthenticated, getChatMedia);
router.delete("/chat/delete-file/:messageId", isAuthenticated, deleteFile);

// Search and Filters
router.get("/chat/search-messages", isAuthenticated, searchMessages);
router.get("/chat/filter-chats", isAuthenticated, filterChats);

// Advanced Features
router.post("/chat/pin-message", isAuthenticated, pinMessage);
router.delete("/chat/unpin-message/:messageId", isAuthenticated, unpinMessage);
router.post("/chat/mute/:chatId", isAuthenticated, muteChat);
router.delete("/chat/unmute/:chatId", isAuthenticated, unmuteChat);
router.post("/chat/block/:chatId", isAuthenticated, blockChat);

export default router;