import express from 'express';
import {
    createRefundRequest,
    approveRefund,
    escalateToSupport,
    fetchDisputedRefunds,
    resolveDispute,
    getSellerRefunds,
    getMyRefundRequests,
    getRefundDetails
} from '../controllers/refundController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Customer routes
router.post('/request', requireRole('Customer'), createRefundRequest);
router.get('/my-requests', requireRole('Customer'), getMyRefundRequests);

// Seller routes
router.get('/seller', requireRole('Seller'), getSellerRefunds);
router.patch('/:id/approve', requireRole('Seller'), approveRefund);
router.patch('/:id/escalate', requireRole('Seller'), escalateToSupport);

// Support routes
router.get('/disputed', requireRole('Support', 'Admin'), fetchDisputedRefunds);
router.patch('/:id/resolve', requireRole('Support', 'Admin'), resolveDispute);

// Common routes
router.get('/:id', getRefundDetails);

export default router;
