import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    type: {
        type: String,
        enum: ['OrderEarning', 'DeliveryFee', 'PlatformFee', 'Payout', 'Refund'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Available', 'Paid'],
        default: 'Pending'
    },
    description: String,
    availableAt: {
        type: Date,
        required: true
    },
    paidAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ availableAt: 1, status: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
