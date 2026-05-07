import { Router } from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/roleMiddleware.js'
import { pendingSellers, approveSeller, users, deleteUser, addDeliveryPartner, analytics, assignOrder, getOrders, payouts, settlePayout } from '../controllers/adminController.js'
import { adminGetAnalytics, adminGetPayoutsSummary, adminGetUserInvoice, adminProcessPayout } from '../controllers/walletController.js'

const r = Router()
r.use(requireAuth, requireRole('Admin'))

// Finance & Wallet Routes
r.get('/finance/analytics', adminGetAnalytics)
r.get('/finance/payouts', adminGetPayoutsSummary)
r.get('/finance/invoice/:userId', adminGetUserInvoice)
r.post('/finance/payout/:userId', adminProcessPayout)

// Legacy payouts (redirect to new system)
r.get('/payouts', payouts)
r.post('/payouts/:sellerId/settle', settlePayout)

// Other admin routes
r.get('/pending-sellers', pendingSellers)
r.post('/approve-seller/:id', approveSeller)
r.get('/users', users)
r.delete('/users/:id', deleteUser)
r.post('/delivery-partners', addDeliveryPartner)
r.get('/orders', getOrders)
r.put('/orders/:id/assign', assignOrder)
r.get('/analytics', analytics)

export default r

