import { updateDeliveryStatusService } from './services/deliveryService.js';
import mongoose from 'mongoose';
import Order from './models/Order.js';

// Connect to DB
mongoose.connect('mongodb://127.0.0.1:27017/urban_edge')
    .then(() => {
        console.log('Connected to DB');
        runTest();
    })
    .catch(err => console.error(err));

async function runTest() {
    try {
        // Find ANY order to simulate update (or one that isn't delivered yet)
        const order = await Order.findOne({ orderStatus: { $ne: 'Delivered' } });
        if (!order) {
            console.log('No eligible order found for testing.');
            process.exit(0);
        }

        console.log(`Testing update on order: ${order._id}`);
        await updateDeliveryStatusService(order._id, 'Delivered');
        console.log('Update Successful');
    } catch (err) {
        console.error('ERROR STACK:', err);
    } finally {
        process.exit(0);
    }
}
