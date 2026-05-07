/**
 * Migration script to create Transaction records for existing delivered orders.
 * Run this once to populate wallet balances for orders delivered before the wallet system.
 */

import mongoose from 'mongoose';
import Order from './models/Order.js';
import Transaction from './models/Transaction.js';
import dotenv from 'dotenv';

dotenv.config();

const PENDING_DAYS = 7;

async function migrate() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce-multi-role');
        console.log('Connected to DB');

        // Find delivered orders that don't have transactions yet
        const deliveredOrders = await Order.find({
            orderStatus: 'Delivered',
            payoutStatus: { $in: ['Pending', 'ReadyForPayout'] }
        });

        console.log(`Found ${deliveredOrders.length} delivered orders to process`);

        let created = 0;
        for (const order of deliveredOrders) {
            // Check if transaction already exists for this order
            const existingTx = await Transaction.findOne({ order: order._id });
            if (existingTx) {
                console.log(`Skipping order ${order._id} - transaction exists`);
                continue;
            }

            // Create seller transaction (make it immediately available for demo)
            const availableAt = new Date(); // Make available NOW for existing orders

            if (order.seller && order.netAmount > 0) {
                await Transaction.create({
                    user: order.seller,
                    order: order._id,
                    type: 'OrderEarning',
                    amount: order.netAmount,
                    status: 'Available', // Already available for existing orders
                    description: `Order #${order._id.toString().slice(-6).toUpperCase()} - Product Sale`,
                    availableAt
                });
                console.log(`Created seller transaction for order ${order._id}: $${order.netAmount}`);
                created++;
            }

            // Create delivery partner transaction
            if (order.deliveryPartner && order.shippingFee > 0) {
                await Transaction.create({
                    user: order.deliveryPartner,
                    order: order._id,
                    type: 'DeliveryFee',
                    amount: order.shippingFee,
                    status: 'Available',
                    description: `Order #${order._id.toString().slice(-6).toUpperCase()} - Delivery Fee`,
                    availableAt
                });
                console.log(`Created delivery transaction for order ${order._id}: $${order.shippingFee}`);
                created++;
            }
        }

        console.log(`\nMigration complete! Created ${created} transactions.`);
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
