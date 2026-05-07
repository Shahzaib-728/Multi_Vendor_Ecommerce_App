import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function createPaymentIntent(req, res, next) {
    try {
        if (!stripe) {
            return res.status(500).json({
                message: 'Stripe is not configured. Please add STRIPE_SECRET_KEY to your .env file.'
            });
        }

        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
            metadata: { integration_check: 'accept_a_payment' },
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        next(err);
    }
}
