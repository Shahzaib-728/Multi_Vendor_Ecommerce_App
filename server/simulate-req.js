/**
 * Simulate Authenticated Request to Wallet API
 * Uses native fetch to call the API with a hardcoded valid token.
 */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const USER_ID = '694da23a0698bcc5e5f31e6a'; // Seller ID
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_change_me_in_prod';

async function simulate() {
    try {
        console.log('Generating token for:', USER_ID);
        // Important: Use the same structure as your jwt.js utility
        const token = jwt.sign({ id: USER_ID, role: 'Seller', email: 'seller@example.com' }, JWT_SECRET, { expiresIn: '1h' });

        console.log('Calling API...');
        const res = await fetch('http://localhost:5000/api/wallet/balance', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body:', text);

    } catch (e) {
        console.error('Error:', e);
    }
}

simulate();
