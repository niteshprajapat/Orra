import express from "express";
import { login, register, logout } from "../controllers/auth.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";


const router = express.Router();




router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, isAdmin, logout);





export default router;