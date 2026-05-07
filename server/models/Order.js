import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
        receiverName: String,
        phone: String,
        street: String,
        area: String,
        city: String,
        province: String,
        zipCode: String,
        country: String
    },
    shippingFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 }, // Seller earnings after fee
    payoutStatus: {
        type: String,
        enum: ['Pending', 'ReadyForPayout', 'Paid'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    paymentMethod: String,
    paymentId: String, // Stripe PaymentIntent ID
    // Timeline Stepper (Replacing Map)
    trackingTimeline: [{
        status: String, // 'Placed', 'Picked Up', 'In Transit', etc.
        location: String, // 'Lahore Hub', 'City A', etc.
        timestamp: { type: Date, default: Date.now },
        note: String
    }],

    orderStatus: {
        type: String,
        // Using descriptive strings mapped to the codes:
        // STATUS_100: Placed
        // STATUS_200: Picked Up
        // STATUS_300: Arrived at Transit Hub
        // STATUS_400: In Transit
        // STATUS_500: Arrived at Destination Hub
        // STATUS_600: Out for Delivery
        // STATUS_700: Delivered
        enum: [
            'Placed',
            'Packed',           // Seller marked as packed
            'Ready for Pickup', // Equivalent to packed (for legacy)
            'Picked Up',        // Courier picked it (STATUS_200)
            'In Transit Hub',   // STATUS_300
            'In Transit',       // STATUS_400
            'Destination Hub',  // STATUS_500
            'Out for Delivery', // STATUS_600
            'Delivered',        // STATUS_700
            'Cancelled',
            'Refunded',
            'Return Pending',
            'Picking Up (Return)',
            'Returned'
        ],
        default: 'Placed'
    },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

// Performance Indexes
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, orderStatus: 1 });
orderSchema.index({ deliveryPartner: 1, orderStatus: 1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
