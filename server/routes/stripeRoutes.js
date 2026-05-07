import express from 'express';
import { createPaymentIntent } from '../controllers/stripeController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create-payment-intent', requireAuth, createPaymentIntent);

export default router;
