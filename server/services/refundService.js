import Order from '../models/Order.js';
import RefundRequest from '../models/RefundRequest.js';
import { createEarningTransaction } from './walletService.js';
import { getIO } from '../socket.js';

export async function performRefund(orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    const refundRequest = await RefundRequest.findOne({ order: orderId });
    if (!refundRequest) throw new Error('Refund request not found');

    // 1. Debit Seller
    await createEarningTransaction(
        order.seller,
        order._id,
        -order.netAmount,
        'Refund',
        `Refund for Order #${order._id.toString().slice(-6).toUpperCase()}`
    );

    // Note: Customer refund is handled via Cash on Delivery by the partner

    // 3. Update Statuses
    order.orderStatus = 'Refunded';
    await order.save();

    refundRequest.status = 'Refunded';
    await refundRequest.save();

    // Notify via Socket
    try {
        const io = getIO();
        io.to(`user_${order.customer}`).emit('notification', { message: 'Your refund has been processed.' });
        io.to(`user_${order.seller}`).emit('notification', { message: 'A refund has been debited from your account.' });
    } catch (e) { }
}
