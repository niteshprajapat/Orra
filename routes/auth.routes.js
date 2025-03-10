import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { login, register, logout, verifyAccount, resentOtp, forgotPassword, resetPassword, changePassword } from "../controllers/auth.controller.js";
import { isAdmin, isAuthenticated } from "../middlewares/authMiddleware.js";


const router = express.Router();




router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.post("/verify-account", isAuthenticated, verifyAccount);
router.post("/resend-otp", resentOtp);


router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", isAuthenticated, changePassword);

// Google OAuth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "http://localhost:3000/login", session: false }),
    (req, res) => {
        const user = req.user;
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // res.redirect(`http://localhost:3000?token=${token}`);
        res.redirect(`http://localhost:5000?token=${token}`);
    }
);


// Github OAuth Routes
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback", passport.authenticate("github", { failureRedirect: "http://localhost:3000/login", session: false }),
    (req, res) => {
        const user = req.user;
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        // res.redirect(`http://localhost:3000?token=${token}`);
        res.redirect(`http://localhost:5000?token=${token}`);

    }

)

export default router;