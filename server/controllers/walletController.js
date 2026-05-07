import {
    getWalletBalance,
    getTransactionHistory,
    processAvailableBalances,
    getAdminWalletSummary,
    getUserInvoice,
    processPayout,
    getPlatformAnalytics
} from '../services/walletService.js';

/**
 * Get current user's wallet balance
 */
/**
 * Get current user's wallet balance
 */
export async function getMyWallet(req, res, next) {
    try {
        console.log('--- getMyWallet Request ---');
        console.log('Headers Auth:', req.headers.authorization);
        console.log('req.user:', JSON.stringify(req.user));
        console.log('req.user.id:', req.user?.id);
        console.log('req.user._id:', req.user?._id);

        // Handle both possible ID locations just in case
        const userId = req.user?.id || req.user?._id;
        console.log('Using userId:', userId);

        const balance = await getWalletBalance(userId);
        console.log('Balance result:', JSON.stringify(balance));
        res.json(balance);
    } catch (err) {
        console.error('getMyWallet Error:', err);
        next(err);
    }
}

/**
 * Get current user's transaction history
 */
export async function getMyTransactions(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const result = await getTransactionHistory(req.user.id, page, limit);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

/**
 * Admin: Get platform analytics
 */
export async function adminGetAnalytics(req, res, next) {
    try {
        const analytics = await getPlatformAnalytics();
        res.json(analytics);
    } catch (err) {
        next(err);
    }
}

/**
 * Admin: Get all pending payouts summary
 */
export async function adminGetPayoutsSummary(req, res, next) {
    try {
        // First, process any pending transactions that are now available
        await processAvailableBalances();

        const summary = await getAdminWalletSummary();
        res.json(summary);
    } catch (err) {
        next(err);
    }
}

/**
 * Admin: Get detailed invoice for a user
 */
export async function adminGetUserInvoice(req, res, next) {
    try {
        const invoice = await getUserInvoice(req.params.userId);
        res.json(invoice);
    } catch (err) {
        next(err);
    }
}

/**
 * Admin: Process payout for a user
 */
export async function adminProcessPayout(req, res, next) {
    try {
        const result = await processPayout(req.params.userId);
        res.json(result);
    } catch (err) {
        next(err);
    }
}
