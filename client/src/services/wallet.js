import api from './api'

// Get wallet balance
export async function getWalletBalance() {
    const { data } = await api.get(`/wallet/balance?_t=${Date.now()}`)
    return data
}

// Get transaction history
export async function getTransactionHistory(page = 1, limit = 20) {
    const { data } = await api.get(`/wallet/transactions?page=${page}&limit=${limit}`)
    return data
}

// Admin: Get finance analytics
export async function getFinanceAnalytics() {
    const { data } = await api.get('/admin/finance/analytics')
    return data
}

// Admin: Get all pending payouts
export async function getFinancePayouts() {
    const { data } = await api.get('/admin/finance/payouts')
    return data
}

// Admin: Get invoice for a user
export async function getUserInvoice(userId) {
    const { data } = await api.get(`/admin/finance/invoice/${userId}`)
    return data
}

// Admin: Process payout
export async function processUserPayout(userId) {
    const { data } = await api.post(`/admin/finance/payout/${userId}`)
    return data
}
