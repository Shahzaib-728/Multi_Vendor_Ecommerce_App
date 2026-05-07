import RefundRequest from '../models/RefundRequest.js';
import Order from '../models/Order.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { createEarningTransaction } from '../services/walletService.js';
import { getIO } from '../socket.js';

// Customer: Create a refund request
export async function createRefundRequest(req, res, next) {
    try {
        const { orderId, customerMessage, images } = req.body;
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if a request already exists
        const existingRequest = await RefundRequest.findOne({ order: orderId });
        if (existingRequest) {
            return res.status(400).json({ message: 'Refund request already exists for this order' });
        }

        const refundRequest = new RefundRequest({
            order: orderId,
            customer: req.user.id,
            seller: order.seller,
            customerMessage,
            images,
            status: 'Pending'
        });

        await refundRequest.save();

        // Optional: Update order status to show refund is pending
        // order.orderStatus = 'Refund Pending'; 
        // await order.save();

        res.status(201).json(refundRequest);
    } catch (err) {
        next(err);
    }
}

// Seller: Approve refund
export async function approveRefund(req, res, next) {
    try {
        const refundRequest = await RefundRequest.findById(req.params.id).populate('order');
        if (!refundRequest) return res.status(404).json({ message: 'Refund request not found' });

        if (refundRequest.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (refundRequest.status !== 'Pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        refundRequest.status = 'Return_Pending';
        refundRequest.resolvedAt = new Date();
        await refundRequest.save();

        // Update Order Status to trigger delivery partner
        const order = await Order.findById(refundRequest.order._id);
        order.orderStatus = 'Return Pending';
        // Add to timeline
        order.trackingTimeline.push({
            status: 'Return Pending',
            location: 'Customer Location',
            note: 'Refund approved. Awaiting pickup for return.'
        });
        await order.save();

        res.json({ message: 'Refund approved and processed', refundRequest });
    } catch (err) {
        next(err);
    }
}

// Seller: Escalate to Support
export async function escalateToSupport(req, res, next) {
    try {
        const { sellerDefense } = req.body;
        const refundRequest = await RefundRequest.findById(req.params.id);

        if (!refundRequest) return res.status(404).json({ message: 'Refund request not found' });
        if (refundRequest.seller.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        refundRequest.status = 'Disputed_By_Seller';
        refundRequest.sellerDefense = sellerDefense;
        await refundRequest.save();

        res.json({ message: 'Escalated to support', refundRequest });
    } catch (err) {
        next(err);
    }
}

// Support: Fetch disputed refunds
export async function fetchDisputedRefunds(req, res, next) {
    try {
        const requests = await RefundRequest.find({ status: 'Disputed_By_Seller' })
            .populate('order')
            .populate('customer', 'name email')
            .populate('seller', 'name email sellerDetails.storeName');
        res.json(requests);
    } catch (err) {
        next(err);
    }
}

// Support: Resolve dispute
export async function resolveDispute(req, res, next) {
    try {
        const { decision } = req.body; // 'Refund' or 'Reject'
        const refundRequest = await RefundRequest.findById(req.params.id).populate('order');

        if (!refundRequest) return res.status(404).json({ message: 'Refund request not found' });
        if (refundRequest.status !== 'Disputed_By_Seller') {
            return res.status(400).json({ message: 'Request is not in dispute' });
        }

        refundRequest.supportDecision = decision;
        refundRequest.resolvedAt = new Date();

        if (decision === 'Refund') {
            refundRequest.status = 'Return_Pending';

            // Update Order Status
            const order = await Order.findById(refundRequest.order._id);
            order.orderStatus = 'Return Pending';
            order.trackingTimeline.push({
                status: 'Return Pending',
                location: 'Customer Location',
                note: 'Dispute resolved in favor of customer. Awaiting pickup for return.'
            });
            await order.save();
        } else {
            refundRequest.status = 'Rejected';
            const order = await Order.findById(refundRequest.order._id);
            order.orderStatus = 'Delivered';
            await order.save();
        }

        await refundRequest.save();
        res.json({ message: `Dispute resolved with decision: ${decision}`, refundRequest });
    } catch (err) {
        next(err);
    }
}


export async function getSellerRefunds(req, res, next) {
    try {
        const requests = await RefundRequest.find({ seller: req.user.id })
            .populate('order')
            .populate('customer', 'name email')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        next(err);
    }
}

export async function getMyRefundRequests(req, res, next) {
    try {
        const requests = await RefundRequest.find({ customer: req.user.id })
            .populate('order')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        next(err);
    }
}

export async function getRefundDetails(req, res, next) {
    try {
        const refund = await RefundRequest.findById(req.params.id)
            .populate({
                path: 'order',
                populate: {
                    path: 'items.product',
                    select: 'name image description'
                }
            })
            .populate('customer', 'name email')
            .populate('seller', 'name email sellerDetails.storeName');

        if (!refund) return res.status(404).json({ message: 'Refund request not found' });

        // Authorization: Customer, Seller, or Support/Admin
        const isCustomer = refund.customer._id.toString() === req.user.id;
        const isSeller = refund.seller._id.toString() === req.user.id;
        const isStaff = ['Support', 'Admin'].includes(req.user.role);

        if (!isCustomer && !isSeller && !isStaff) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(refund);
    } catch (err) {
        next(err);
    }
}
