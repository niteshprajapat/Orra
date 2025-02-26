import express from "express";
import { login, register, logout, verifyAccount, resentOtp } from "../controllers/auth.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";


const router = express.Router();




router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.post("/verify-account", isAuthenticated, verifyAccount);
router.post("/resend-otp", resentOtp);





export default router;