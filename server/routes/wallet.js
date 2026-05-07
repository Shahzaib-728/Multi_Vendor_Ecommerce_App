import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';
import {
    getMyWallet,
    getMyTransactions
} from '../controllers/walletController.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Get wallet balance (for Sellers and Delivery Partners)
router.get('/balance', getMyWallet);

// Get transaction history
router.get('/transactions', getMyTransactions);

export default router;
