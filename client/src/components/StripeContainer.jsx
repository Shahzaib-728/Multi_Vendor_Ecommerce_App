import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Use environment variable or placeholder
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export default function StripeContainer({ children }) {
    return (
        <Elements stripe={stripePromise}>
            {children}
        </Elements>
    );
}
