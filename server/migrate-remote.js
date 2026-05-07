/**
 * Migration script to create Transaction records for existing delivered orders.
 * Explicitly connects to Remote DB.
 */

import mongoose from 'mongoose';
import Order from './models/Order.js';
import Transaction from './models/Transaction.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') }); // Explicit path

async function migrate() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('MONGO_URI not found in .env');

        console.log('Connecting to:', uri.split('@')[1]); // Log masked URI
        await mongoose.connect(uri);
        console.log('Connected to DB');

        // Find delivered orders
        const deliveredOrders = await Order.find({
            orderStatus: 'Delivered'
        });

        console.log(`Found ${deliveredOrders.length} delivered orders to process`);

        let created = 0;
        for (const order of deliveredOrders) {
            // Check if transaction already exists for this order
            const existingTx = await Transaction.findOne({ order: order._id });
            if (existingTx) {
                // If it exists but is "Paid", it won't show in balance.
                // But for "Zero stats", user says "No transactions yet".
                // So likely they don't exist.
                continue;
            }

            const availableAt = new Date(); // Immediately available

            // Create seller transaction
            if (order.seller && order.netAmount > 0) {
                await Transaction.create({
                    user: order.seller,
                    order: order._id,
                    type: 'OrderEarning',
                    amount: order.netAmount,
                    status: 'Available',
                    description: `Order #${order._id.toString().slice(-6).toUpperCase()} - Product Sale`,
                    availableAt
                });
                created++;
            }

            // Create delivery transaction
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
