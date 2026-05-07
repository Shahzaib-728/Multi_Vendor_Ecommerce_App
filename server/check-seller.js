import mongoose from 'mongoose';
import Transaction from './models/Transaction.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const targetId = '694da23a0698bcc5e5f31e6a';

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const txs = await Transaction.find({ user: targetId });
    const balance = txs.filter(t => t.status !== 'Paid').reduce((sum, t) => sum + t.amount, 0);
    console.log(`\n\nRESULT: Seller ${targetId} has ${txs.length} total txs. Balance: $${balance}\n\n`);
    process.exit();
}
check();
