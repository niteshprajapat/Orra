import express from "express";

import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { confirmSubscription, createSubscription } from "../controllers/payment.controller.js";


const router = express.Router();

router.post("/create-subscription", isAuthenticated, createSubscription);
router.post('/confirm-subscription', isAuthenticated, confirmSubscription);



export default router;