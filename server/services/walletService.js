import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { getIO } from '../socket.js';

const PENDING_DAYS = 0; // Earnings are immediately available (no hold period)

/**
 * Get wallet balance for a user (Seller or Delivery Partner)
 */
export async function getWalletBalance(userId) {
    const now = new Date();

    // Get all non-paid transactions for this user
    const transactions = await Transaction.find({
        user: userId,
        status: { $ne: 'Paid' },
        type: { $in: ['OrderEarning', 'DeliveryFee'] }
    });

    let currentBalance = 0;
    let pendingBalance = 0;

    for (const tx of transactions) {
        if (tx.status === 'Available' || tx.availableAt <= now) {
            currentBalance += tx.amount;
        } else {
            pendingBalance += tx.amount;
        }
    }

    return { currentBalance, pendingBalance };
}

/**
 * Get transaction history for a user
 */
export async function getTransactionHistory(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ user: userId })
        .populate('order', 'totalAmount orderStatus createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Transaction.countDocuments({ user: userId });

    return {
        transactions,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
}

/**
 * Create earning transaction when order is delivered
 * Earnings are immediately available for payout
 */
export async function createEarningTransaction(userId, orderId, amount, type, description = '') {
    const availableAt = new Date(); // Immediately available

    const transaction = new Transaction({
        user: userId,
        order: orderId,
        type,
        amount,
        status: 'Available', // Immediately available for payout
        description,
        availableAt
    });

    await transaction.save();

    // Emit realtime update
    try {
        const io = getIO();
        io.to(`user_${userId}`).emit('wallet_updated');
        io.to('admin_finance').emit('finance_updated'); // Notify admin
    } catch (e) {
        console.error('Socket emit failed:', e);
    }

    return transaction;
}

/**
 * Process pending transactions that are now available
 * Should be called periodically (cron job) or on-demand
 */
export async function processAvailableBalances() {
    const now = new Date();

    const result = await Transaction.updateMany(
        {
            status: 'Pending',
            availableAt: { $lte: now }
        },
        {
            $set: { status: 'Available' }
        }
    );

    return result.modifiedCount;
}

/**
 * Get wallet summary for admin - all pending payouts grouped by user
 */
export async function getAdminWalletSummary() {
    const now = new Date();

    // Aggregate transactions by user
    const summary = await Transaction.aggregate([
        {
            $match: {
                status: { $ne: 'Paid' },
                type: { $in: ['OrderEarning', 'DeliveryFee'] }
            }
        },
        {
            $group: {
                _id: '$user',
                totalEarnings: { $sum: '$amount' },
                availableBalance: {
                    $sum: {
                        $cond: [
                            { $lte: ['$availableAt', now] },
                            '$amount',
                            0
                        ]
                    }
                },
                pendingBalance: {
                    $sum: {
                        $cond: [
                            { $gt: ['$availableAt', now] },
                            '$amount',
                            0
                        ]
                    }
                },
                transactionCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'userInfo'
            }
        },
        { $unwind: '$userInfo' },
        {
            $project: {
                userId: '$_id',
                name: '$userInfo.name',
                email: '$userInfo.email',
                role: '$userInfo.role',
                storeName: '$userInfo.sellerDetails.storeName',
                bankDetails: '$userInfo.sellerDetails.bankDetails',
                totalEarnings: 1,
                availableBalance: 1,
                pendingBalance: 1,
                transactionCount: 1
            }
        },
        { $sort: { availableBalance: -1 } }
    ]);

    return summary;
}

/**
 * Get detailed invoice for a specific user
 */
export async function getUserInvoice(userId) {
    const user = await User.findById(userId).select('name email role sellerDetails');

    const transactions = await Transaction.find({
        user: userId,
        status: { $ne: 'Paid' }
    }).populate('order', 'totalAmount shippingFee platformFee netAmount createdAt items');

    const balance = await getWalletBalance(userId);

    return {
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            storeName: user.sellerDetails?.storeName,
            bankDetails: user.sellerDetails?.bankDetails
        },
        balance,
        transactions: transactions.map(tx => ({
            id: tx._id,
            orderId: tx.order?._id,
            type: tx.type,
            amount: tx.amount,
            status: tx.status,
            description: tx.description,
            availableAt: tx.availableAt,
            createdAt: tx.createdAt
        }))
    };
}

/**
 * Process payout for a user - mark all available transactions as paid
 */
export async function processPayout(userId) {
    const now = new Date();

    // Only pay out available balances
    const result = await Transaction.updateMany(
        {
            user: userId,
            status: { $in: ['Pending', 'Available'] },
            availableAt: { $lte: now }
        },
        {
            $set: {
                status: 'Paid',
                paidAt: now
            }
        }
    );

    // Emit realtime update
    try {
        const io = getIO();
        io.to(`user_${userId}`).emit('wallet_updated');
        io.to('admin_finance').emit('finance_updated');
    } catch (e) {
        console.error('Socket emit failed:', e);
    }

    return {
        success: true,
        paidTransactions: result.modifiedCount
    };
}

/**
 * Get platform revenue analytics for admin
 */
export async function getPlatformAnalytics() {
    // Base Match for valid revenue-generating orders
    const validOrderMatch = { orderStatus: { $nin: ['Cancelled', 'Refunded'] } };

    // Total platform fees collected (from orders)
    const platformFees = await Order.aggregate([
        { $match: validOrderMatch },
        { $group: { _id: null, total: { $sum: '$platformFee' } } }
    ]);

    // Total sales
    const totalSales = await Order.aggregate([
        { $match: validOrderMatch },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Refund stats
    const refundAgg = await Order.aggregate([
        { $match: { orderStatus: 'Refunded' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    // Total payouts made
    const totalPaidOut = await Transaction.aggregate([
        { $match: { status: 'Paid', type: { $in: ['OrderEarning', 'DeliveryFee'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Pending payouts
    const pendingPayouts = await Transaction.aggregate([
        { $match: { status: { $ne: 'Paid' }, type: { $in: ['OrderEarning', 'DeliveryFee'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    return {
        totalSales: totalSales[0]?.total || 0,
        platformProfit: platformFees[0]?.total || 0,
        totalPaidOut: totalPaidOut[0]?.total || 0,
        pendingPayouts: pendingPayouts[0]?.total || 0,
        totalRefundedAmount: refundAgg[0]?.total || 0,
        totalRefundedCount: refundAgg[0]?.count || 0
    };
}
