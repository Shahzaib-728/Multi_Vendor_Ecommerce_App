import { getPayoutsService } from './services/adminService.js';
import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/urban_edge')
    .then(() => {
        console.log('DB Connected');
        testPayouts();
    })
    .catch(err => console.error('DB Connection Failed:', err));

async function testPayouts() {
    try {
        console.log('Fetching payouts...');
        const result = await getPayoutsService();
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        process.exit(0);
    }
}
