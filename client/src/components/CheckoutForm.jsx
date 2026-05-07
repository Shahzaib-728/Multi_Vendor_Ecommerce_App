import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import api from '../services/api';

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
};

export default function CheckoutForm({ amount, onPaymentSuccess, loading: parentLoading }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setProcessing(true);
        setError(null);

        try {
            // 1. Create PaymentIntent on the backend
            const { data: { clientSecret } } = await api.post('/stripe/create-payment-intent', { amount });

            // 2. Confirm Payment on the frontend
            const payload = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                }
            });

            if (payload.error) {
                setError(`Payment failed: ${payload.error.message}`);
                setProcessing(false);
            } else {
                setError(null);
                setProcessing(false);
                onPaymentSuccess(payload.paymentIntent);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Payment initiation failed');
            setProcessing(false);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 sm:p-4 bg-white border rounded-xl shadow-sm">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
            {error && <div className="text-red-500 text-sm font-bold bg-red-50 p-2 rounded border border-red-100">{error}</div>}

            {/* The actual button is usually in the parent, but we can have it here or trigger from parent */}
            {/* For now, let's keep the button here but style it to match the parent */}
            <button
                disabled={processing || !stripe || parentLoading}
                className="w-full min-h-12 bg-black text-white py-3 border-2 border-black font-semibold hover:bg-white hover:text-black transition-all uppercase tracking-wider text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                type="submit"
            >
                {processing ? 'Processing Payment...' : `Confirm & Pay $${amount.toFixed(2)}`}
            </button>
        </form>
    );
}
