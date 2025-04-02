import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";
import { addParticipantToGroup, createGroupChat, createOneToOneChat, deleteGroupChat, deleteMessage, deleteOneToOneChat, editMessage, getChatMessages, leaveGroupChat, markMessageRead, removeUserFromGroup, sendMessage } from "../controllers/chat.controller.js";

const router = express.Router();


router.post("/chat/one-to-one", isAuthenticated, createOneToOneChat);
router.post("/chat/group-chat", isAuthenticated, createGroupChat);
router.post("/chat/sendMessage", isAuthenticated, sendMessage);
router.get("/chat/getChatMessages/:chatId", isAuthenticated, getChatMessages);
router.get("/message-read/:messageId", isAuthenticated, markMessageRead);
router.put("/chat/group/add", isAuthenticated, addParticipantToGroup);
router.delete("/chat/delete-group-chat/:chatId", isAuthenticated, deleteGroupChat);

router.delete("/chat/delete-message/:messageId", isAuthenticated, deleteMessage);
router.delete("/chat/delete-one-to-one-chat/:chatId", isAuthenticated, deleteOneToOneChat);
router.delete("/chat/group/remove-user/:chatId", isAuthenticated, removeUserFromGroup);
router.put("/chat/group/leave/:chatId", isAuthenticated, leaveGroupChat);
router.put("/chat/edit-message/:messageId", isAuthenticated, editMessage);


export default router;