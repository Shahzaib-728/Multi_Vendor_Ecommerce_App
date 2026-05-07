/**
 * Test Wallet API
 * Generates a token for a specific user and calls the wallet API.
 */
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Fetch is native in Node 18+

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const USER_ID = '694da23a0698bcc5e5f31e6a'; // The seller found in audit
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_me_in_prod';

async function test() {
    try {
        // 1. Generate Token
        const token = jwt.sign({ id: USER_ID }, JWT_SECRET, { expiresIn: '1d' });
        console.log('Generated Token for ID:', USER_ID);

        // 2. Call API
        const response = await fetch('http://localhost:5000/api/wallet/balance', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('\n--- Wallet API Response ---');
        console.log(JSON.stringify(data, null, 2));

        if (data.currentBalance > 0 || data.pendingBalance > 0) {
            console.log('\nSUCCESS: Data is being returned!');
        } else {
            console.log('\nWARNING: Balance is 0. Check transactions.');
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
