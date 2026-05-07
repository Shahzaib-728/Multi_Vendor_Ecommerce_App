/**
 * Debug script to check wallet transactions
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function debug() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce-multi-role');
        console.log('Connected to DB\n');

        const Transaction = (await import('./models/Transaction.js')).default;
        const User = (await import('./models/User.js')).default;

        // Get all transactions
        const transactions = await Transaction.find().populate('user', 'name email role');
        console.log(`Total Transactions: ${transactions.length}\n`);

        transactions.forEach(tx => {
            console.log(`${tx.user?.name || tx.user} | ${tx.type} | $${tx.amount} | ${tx.status}`);
        });

        // Get sellers and delivery partners
        const users = await User.find({ role: { $in: ['Seller', 'Delivery'] } }).select('name email role');
        console.log(`\nUsers (Seller/Delivery): ${users.length}`);
        users.forEach(u => console.log(`${u._id} | ${u.name} | ${u.role}`));

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

debug();
