/**
 * Comprehensive Data Audit Script
 * Checks Users, Orders, and Transactions to verify relationships.
 */

import mongoose from 'mongoose';
import User from './models/User.js';
import Order from './models/Order.js';
import Transaction from './models/Transaction.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function audit() {
    try {
        const uri = process.env.MONGO_URI;
        console.log('Connecting to DB...');
        await mongoose.connect(uri);
        console.log('Connected.\n');

        // 1. List All Sellers and Delivery Partners
        console.log('--- USERS (Seller/Delivery) ---');
        const users = await User.find({ role: { $in: ['Seller', 'Delivery'] } });
        users.forEach(u => {
            console.log(`[${u.role}] ${u.name} (${u.email}) | ID: ${u._id}`);
        });
        console.log(`Total: ${users.length}\n`);

        // 2. List All Delivered Orders
        console.log('--- DELIVERED ORDERS ---');
        const orders = await Order.find({ orderStatus: 'Delivered' });
        orders.forEach(o => {
            console.log(`Order ${o._id} | Seller: ${o.seller} | Delivery: ${o.deliveryPartner} | Amt: ${o.netAmount} | Ship: ${o.shippingFee}`);
        });
        console.log(`Total: ${orders.length}\n`);

        // 3. List All Transactions
        console.log('--- TRANSACTIONS ---');
        const transactions = await Transaction.find({});
        transactions.forEach(t => {
            console.log(`Tx ${t._id} | User: ${t.user} | Order: ${t.order} | Type: ${t.type} | Amt: ${t.amount} | Status: ${t.status}`);
        });
        console.log(`Total: ${transactions.length}\n`);

        // 4. Verify Relationships (Focused)
        console.log('--- FOCUSED VERIFICATION ---');
        const targetId = '694da23a0698bcc5e5f31e6a';

        const userTxs = transactions.filter(t => t.user.toString() === targetId);
        const txPending = userTxs.filter(t => t.status !== 'Paid');
        const txTotal = txPending.reduce((sum, t) => sum + t.amount, 0);

        console.log(`Target Seller ID: ${targetId}`);
        console.log(`Total Transactions: ${userTxs.length}`);
        console.log(`Non-Paid Transactions: ${txPending.length}`);
        console.log(`Calculated Balance: $${txTotal}`);

        console.log('\n--- DETAILS ---');
        userTxs.forEach(t => {
            console.log(`Type: ${t.type} | Amt: ${t.amount} | Status: ${t.status} | Order: ${t.order}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('Audit failed:', err);
        process.exit(1);
    }
}

audit();
