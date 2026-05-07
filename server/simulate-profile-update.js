import mongoose from 'mongoose';
import User from './models/User.js';
import { updateUserService } from './services/authService.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce-multi-role';

async function testUpdate() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // Find a Delivery user
        const user = await User.findOne({ role: 'Delivery' });
        if (!user) {
            console.error('No Delivery user found');
            process.exit(1);
        }

        console.log('Testing update for user:', user._id);

        const payload = {
            name: user.name,
            phoneNumber: '+923001234567',
            serviceAreas: ['Lahore, Punjab', 'Karachi, Sindh'],
            vehicleDetails: {
                vehicleType: 'Bike',
                licensePlate: 'ABC-786'
            }
        };

        const updated = await updateUserService(user._id, payload);
        console.log('Update Successful!', updated);

    } catch (error) {
        console.error('Update Failed!');
        console.error('Error Message:', error.message);
        if (error.errors) {
            console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
        }
    } finally {
        await mongoose.disconnect();
    }
}

testUpdate();
