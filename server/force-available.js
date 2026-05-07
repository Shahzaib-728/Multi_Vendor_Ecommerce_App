/**
 * Force Update Pending Transactions
 * Updates all transactions with 'Pending' status to 'Available' immediately.
 */
import mongoose from 'mongoose';
import Transaction from './models/Transaction.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function fix() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const now = new Date();

        // Find pending transactions
        const pending = await Transaction.find({ status: 'Pending' });
        console.log(`Found ${pending.length} pending transactions.`);

        if (pending.length > 0) {
            const result = await Transaction.updateMany(
                { status: 'Pending' },
                {
                    $set: {
                        status: 'Available',
                        availableAt: now
                    }
                }
            );
            console.log(`Updated ${result.modifiedCount} transactions to Available.`);
        } else {
            // Also check for transactions that are Available but have future dates (unlikely but possible)
            // Actually, getWalletBalance uses (status === 'Available' || availableAt <= now). 
            // So if status is 'Available', date doesn't matter.
            // But let's check if there are any transactions that are NOT 'Paid' and NOT 'Available'
            const others = await Transaction.find({
                status: { $nin: ['Paid', 'Available'] }
            });
            console.log(`Found ${others.length} other non-available transactions (e.g. 'Processing'?).`);
            if (others.length > 0) {
                others.forEach(t => console.log(`- ${t._id}: ${t.status}`));
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Fix failed:', err);
        process.exit(1);
    }
}

fix();
