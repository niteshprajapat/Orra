import Stripe from "stripe";
import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";
import dotenv from "dotenv";

dotenv.config({});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// createSubscription
export const createSubscription = async (req, res) => {
    try {
        const { paymentMethodId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);


        // create new stripe customer
        const customer = await stripe.customers.create({
            email: user.email,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            }
        });

        // create a subscription using priceId
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    price: process.env.STRIPE_PRICE_ID
                }
            ],
            expand: ['latest_invoice.payment_intent'],
        });


        console.log("subscription => ", subscription);

        // save subscription details to DB
        await Subscription.create({
            userId,
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });

        // create a transaction record
        await Transaction.create({
            userId,
            stripePaymentIntentId: subscription.latest_invoice.payment_intent.id,
            amount: subscription.latest_invoice.amount_due,
            currency: "usd",
            status: subscription.latest_invoice.payment_intent.status,
            paymentMethod: subscription.latest_invoice.payment_intent.payment_method,
            description: 'Subscription payment initialization',
        });

        return res.status(201).json({
            subscriptionId: subscription.id,
            clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            subscriptionStatus: subscription.status,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error in createSubscription API!"
        })
    }
}


// confirmSubscription
export const confirmSubscription = async (req, res) => {
    try {
        const { subscriptionId } = req.body;

        // Retrieve the latest subscription details from Stripe.
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Update the subscription record in your database.
        await Subscription.findOneAndUpdate(
            { stripeSubscriptionId: subscriptionId },
            {
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
        );

        res.status(200).json({
            subscriptionId,
            subscriptionStatus: subscription.status,
        });
    } catch (error) {
        console.error("Error confirming subscription:", error);
        res.status(500).json({ error: error.message });
    }
};