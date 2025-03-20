import Stripe from "stripe";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import dotenv from "dotenv";

dotenv.config({});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// // createSubscription
// export const createSubscription = async (req, res) => {
//     try {
//         const { paymentMethodId } = req.body;
//         const userId = req.user._id;

//         const user = await User.findById(userId);


//         // create new stripe customer
//         const customer = await stripe.customers.create({
//             email: user.email,
//             payment_method: paymentMethodId,
//             invoice_settings: {
//                 default_payment_method: paymentMethodId,
//             }
//         });

//         // create a subscription using priceId
//         const subscription = await stripe.subscriptions.create({
//             customer: customer.id,
//             items: [
//                 {
//                     price: process.env.STRIPE_PRICE_ID
//                 }
//             ],
//             expand: ['latest_invoice.payment_intent'],
//         });


//         console.log("subscription => ", subscription);

//         // save subscription details to DB
//         await Subscription.create({
//             userId,
//             stripeSubscriptionId: subscription.id,
//             status: subscription.status,
//             currentPeriodStart: new Date(subscription.current_period_start * 1000),
//             currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//         });

//         // create a transaction record
//         await Transaction.create({
//             userId,
//             stripePaymentIntentId: subscription.latest_invoice.payment_intent.id,
//             amount: subscription.latest_invoice.amount_due,
//             currency: "usd",
//             status: subscription.latest_invoice.payment_intent.status,
//             paymentMethod: subscription.latest_invoice.payment_intent.payment_method,
//             description: 'Subscription payment initialization',
//         });

//         return res.status(201).json({
//             subscriptionId: subscription.id,
//             clientSecret: subscription.latest_invoice.payment_intent.client_secret,
//             subscriptionStatus: subscription.status,
//         })

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "Error in createSubscription API!"
//         })
//     }
// }


// // confirmSubscription
// export const confirmSubscription = async (req, res) => {
//     try {
//         const { subscriptionId } = req.body;

//         // Retrieve the latest subscription details from Stripe.
//         const subscription = await stripe.subscriptions.retrieve(subscriptionId);

//         // Update the subscription record in your database.
//         await Subscription.findOneAndUpdate(
//             { stripeSubscriptionId: subscriptionId },
//             {
//                 status: subscription.status,
//                 currentPeriodStart: new Date(subscription.current_period_start * 1000),
//                 currentPeriodEnd: new Date(subscription.current_period_end * 1000),
//             }
//         );

//         return res.status(200).json({
//             subscriptionId,
//             subscriptionStatus: subscription.status,
//         });
//     } catch (error) {
//         console.error("Error confirming subscription:", error);
//         res.status(500).json({ error: error.message });
//     }
// };


// // cancelSubscription
// export const cancelSubscription = async (req, res) => {
//     try {
//         const { subscriptionId } = req.body;

//         const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);

//         await Subscription.findOneAndUpdate(
//             { stripeSubscriptionId: subscriptionId },
//             { status: canceledSubscription.status }
//         );

//         return res.status(200).json({
//             subscriptionId: canceledSubscription.id,
//             subscriptionStatus: canceledSubscription.status,
//         });

//     } catch (error) {
//         console.error("Error canceling subscription:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // getSubscriptionDetails
// export const getSubscriptionDetails = async (req, res) => {
//     try {
//         const { subscriptionId } = req.params;

//         const subscription = await stripe.subscriptions.retrieve(subscriptionId);
//         res.status(200).json(subscription);
//     } catch (error) {
//         console.error("Error retrieving subscription details:", error);
//         res.status(500).json({ error: error.message });
//     }
// };




// // 5. Update customer payment method
// export const updatePaymentMethod = async (req, res) => {
//     try {
//         const { customerId, newPaymentMethodId } = req.body;

//         // Update the customer's default payment method in Stripe.
//         const customer = await stripe.customers.update(customerId, {
//             invoice_settings: { default_payment_method: newPaymentMethodId },
//         });

//         res.status(200).json({
//             customerId: customer.id,
//             defaultPaymentMethod: customer.invoice_settings.default_payment_method,
//         });
//     } catch (error) {
//         console.error("Error updating payment method:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // 6. List transactions for a user
// export const listTransactions = async (req, res) => {
//     try {
//         const userId = req.user.userId;

//         // Retrieve transactions from your database.
//         const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });
//         res.status(200).json(transactions);
//     } catch (error) {
//         console.error("Error listing transactions:", error);
//         res.status(500).json({ error: error.message });
//     }
// };

// // 7. Retry a failed invoice payment
// export const retryInvoicePayment = async (req, res) => {
//     try {
//         const { subscriptionId } = req.body;

//         // Retrieve the subscription with expanded invoice payment intent.
//         const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
//             expand: ['latest_invoice.payment_intent'],
//         });

//         // Ensure the payment intent is in a state that can be retried.
//         if (subscription.latest_invoice.payment_intent.status !== 'requires_payment_method') {
//             return res.status(400).json({
//                 message: 'Payment intent is not in a state to be retried',
//             });
//         }

//         // Return the client secret so the client can retry the payment.
//         res.status(200).json({
//             clientSecret: subscription.latest_invoice.payment_intent.client_secret,
//         });
//     } catch (error) {
//         console.error("Error retrying invoice payment:", error);
//         res.status(500).json({ error: error.message });
//     }
// };



export const createSubscription = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);

        // Check if the user already has a paused subscription
        const existingSubscription = await Subscription.findOne({ userId });

        if (existingSubscription) {
            if (existingSubscription.status === "paused") {
                return res.status(400).json({
                    success: false,
                    message: "You already have a paused subscription. Resume it instead of creating a new one.",
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "You already have an active subscription.",
                });
            }
        }

        // Create a new Stripe customer
        const customer = await stripe.customers.create({
            email: user.email,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            }
        });

        // Create a subscription using priceId
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: process.env.STRIPE_PRICE_ID }],
            expand: ['latest_invoice.payment_intent'],
        });

        // Save subscription details to DB
        await Subscription.create({
            userId,
            stripeCustomerId: customer.id, // Store Stripe Customer ID
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });

        return res.status(201).json({
            success: true,
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            subscriptionStatus: subscription.status,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createSubscription API!"
        });
    }
};



export const confirmSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        // Retrieve subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Update subscription status in DB
        await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
        );

        return res.status(200).json({
            subscriptionId,
            subscriptionStatus: subscription.status,
        });
    } catch (error) {
        console.error("Error confirming subscription:", error);
        res.status(500).json({ error: error.message });
    }
};


export const cancelSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        let canceledSubscription;

        if (subscription.pause_collection) {
            // If paused, cancel immediately
            canceledSubscription = await stripe.subscriptions.del(subscriptionId);
        } else {
            // If active, cancel at period end
            canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
            });
        }

        await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            { status: "canceled" }
        );

        return res.status(200).json({
            message: "Subscription canceled successfully",
            subscriptionId: canceledSubscription.id,
            subscriptionStatus: "canceled",
        });

    } catch (error) {
        console.error("Error canceling subscription:", error);
        res.status(500).json({ error: error.message });
    }
};





export const getSubscriptionDetails = async (req, res) => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        return res.status(200).json({
            id: subscription.id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            isPaused: subscription.pause_collection ? true : false,
        });
    } catch (error) {
        console.error("Error retrieving subscription details:", error);
        res.status(500).json({ error: error.message });
    }
};



export const updatePaymentMethod = async (req, res) => {
    try {
        const { newPaymentMethodId } = req.body;
        const userId = req.user._id;

        // Retrieve customer's Stripe ID from DB
        const subscription = await Subscription.findOne({ userId });
        if (!subscription || !subscription.stripeCustomerId) {
            return res.status(404).json({ message: "Customer ID not found for user" });
        }

        // Update the customer's default payment method in Stripe
        const customer = await stripe.customers.update(subscription.stripeCustomerId, {
            invoice_settings: { default_payment_method: newPaymentMethodId },
        });

        res.status(200).json({
            customerId: customer.id,
            defaultPaymentMethod: customer.invoice_settings.default_payment_method,
        });
    } catch (error) {
        console.error("Error updating payment method:", error);
        res.status(500).json({ error: error.message });
    }
};


export const listTransactions = async (req, res) => {
    try {
        const userId = req.user._id;

        // Retrieve transactions from DB
        const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        console.error("Error listing transactions:", error);
        res.status(500).json({ error: error.message });
    }
};



export const retryInvoicePayment = async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['latest_invoice.payment_intent'],
        });

        if (!subscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        if (subscription.status === "paused") {
            return res.status(400).json({
                message: "You cannot retry a payment for a paused subscription. Resume it first.",
            });
        }

        if (subscription.latest_invoice.payment_intent.status !== 'requires_payment_method') {
            return res.status(400).json({
                message: 'Payment intent is not in a state to be retried',
            });
        }

        res.status(200).json({
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        });

    } catch (error) {
        console.error("Error retrying invoice payment:", error);
        res.status(500).json({ error: error.message });
    }
};



export const pauseSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        // Pause the subscription in Stripe
        const pausedSubscription = await stripe.subscriptions.update(subscriptionId, {
            pause_collection: { behavior: "keep_as_draft" }, // Keeps the subscription paused without marking as uncollectible
        });

        // Update the subscription status in the database
        await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            { status: "paused" },
            { new: true }
        );

        return res.status(200).json({
            message: "Subscription paused successfully",
            subscriptionId: pausedSubscription.id,
            subscriptionStatus: "paused",
        });

    } catch (error) {
        console.error("Error pausing subscription:", error);
        res.status(500).json({ error: error.message });
    }
};


export const resumeSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        // Resume the subscription in Stripe
        const resumedSubscription = await stripe.subscriptions.update(subscriptionId, {
            pause_collection: null, // Removes the pause
        });

        // Update the subscription status in the database
        await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            { status: "active" },
            { new: true }
        );

        return res.status(200).json({
            message: "Subscription resumed successfully",
            subscriptionId: resumedSubscription.id,
            subscriptionStatus: "active",
        });

    } catch (error) {
        console.error("Error resuming subscription:", error);
        res.status(500).json({ error: error.message });
    }
};


export const getUserSubscription = async (req, res) => {
    try {
        const userId = req.user._id;

        const subscription = await Subscription.findOne({ userId, status: "active" });

        if (!subscription) {
            return res.status(404).json({ message: "No active subscription found" });
        }

        return res.status(200).json(subscription);
    } catch (error) {
        console.error("Error fetching user subscription:", error);
        res.status(500).json({ error: error.message });
    }
};


export const changeSubscriptionPlan = async (req, res) => {
    try {
        const { subscriptionId, newPriceId } = req.body;

        const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
            items: [{ price: newPriceId }],
            proration_behavior: "create_prorations",
        });

        await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            {
                status: updatedSubscription.status,
                currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
            }
        );

        return res.status(200).json({
            subscriptionId: updatedSubscription.id,
            subscriptionStatus: updatedSubscription.status,
        });

    } catch (error) {
        console.error("Error changing subscription plan:", error);
        res.status(500).json({ error: error.message });
    }
};
