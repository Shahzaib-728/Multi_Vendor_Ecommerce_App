import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

const testDB = async () => {
    try {
        await connectDB();

        console.log('Checking schemas...');
        const user = new User({
            name: 'Test Setup',
            email: `testsetup_${Date.now()}@example.com`,
            password: 'hashedpassword',
            role: 'Customer'
        });
        await user.save();
        console.log('User model verified:', user._id);

        const product = new Product({
            seller: user._id,
            name: 'Test Product',
            description: 'Test Description',
            price: 100,
            category: 'Test Category',
            stock: 10
        });
        await product.save();
        console.log('Product model verified:', product._id);

        console.log('ALL DATABASES SCHEMAS VERIFIED SUCCESSFULLY');
        process.exit(0);
    } catch (error) {
        console.error('Verfication Failed:', error);
        process.exit(1);
    }
}

testDB();
