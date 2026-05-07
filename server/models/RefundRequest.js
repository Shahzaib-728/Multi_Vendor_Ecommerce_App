import mongoose from 'mongoose';

const refundRequestSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    images: [String], // URLs to proof of damage images
    customerMessage: {
        type: String,
        required: true
    },
    sellerDefense: String,
    status: {
        type: String,
        enum: ['Pending', 'Approved_By_Seller', 'Disputed_By_Seller', 'Return_Pending', 'In_Return_Transit', 'Returned', 'Refunded', 'Rejected'],
        default: 'Pending'
    },
    supportDecision: {
        type: String,
        enum: ['Refund', 'Reject', 'None'],
        default: 'None'
    },
    resolvedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const RefundRequest = mongoose.model('RefundRequest', refundRequestSchema);
export default RefundRequest;
