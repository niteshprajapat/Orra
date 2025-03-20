import express from "express";

import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { cancelSubscription, confirmSubscription, createSubscription, getSubscriptionDetails, listTransactions, retryInvoicePayment, updatePaymentMethod } from "../controllers/payment.controller.js";


const router = express.Router();

router.post("/create-subscription", isAuthenticated, createSubscription);
router.post('/confirm-subscription', isAuthenticated, confirmSubscription);
router.post('/cancel-subscription', isAuthenticated, cancelSubscription);


// Endpoint to retrieve subscription details.
router.get('/subscription/:subscriptionId', isAuthenticated, getSubscriptionDetails);

// Endpoint to update the customer's default payment method.
router.put('/update-payment-method', isAuthenticated, updatePaymentMethod);

// Endpoint to list transactions for a specific user.
// router.get('/transactions/:userId', isAuthenticated, listTransactions);
router.get('/transactions', isAuthenticated, listTransactions);

// Endpoint to retry a failed invoice payment.
router.post('/retry-invoice', isAuthenticated, retryInvoicePayment);


// WEBHOOK

router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );

        if (event.type === "invoice.payment_succeeded") {
            const subscriptionId = event.data.object.subscription;

            await Subscription.findOneAndUpdate(
                { stripeSubscriptionId: subscriptionId },
                { status: "active" }
            );
        }

        if (event.type === "customer.subscription.deleted") {
            const subscriptionId = event.data.object.id;

            await Subscription.findOneAndUpdate(
                { stripeSubscriptionId: subscriptionId },
                { status: "canceled" }
            );
        }

        res.status(200).send("Event received");
    } catch (error) {
        console.error("Webhook error:", error);
        res.status(400).send(`Webhook error: ${error.message}`);
    }
});



export default router;