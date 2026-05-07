import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Review from './models/Review.js';
import Ticket from './models/Ticket.js';
import Cart from './models/Cart.js';
import connectDB from './config/db.js';

dotenv.config();

const resetDB = async () => {
    try {
        await connectDB();
        console.log('Connected to DB...');

        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Review.deleteMany({});
        await Ticket.deleteMany({});
        await Cart.deleteMany({});
        console.log('Data cleared.');

        console.log('Seeding default users...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'Admin',
                phoneNumber: '1234567890'
            },
            {
                name: 'Seller User',
                email: 'seller@example.com',
                password: hashedPassword,
                role: 'Seller',
                sellerDetails: {
                    storeName: 'Best Deals Store',
                    storeDescription: 'All kinds of electronics',
                    businessAddress: '123 Market St',
                    businessPhone: '9876543210',
                    category: 'Electronics',
                    approvalStatus: 'Approved',
                    bankDetails: {
                        bankName: 'Test Bank',
                        accountNumber: '1234567890',
                        accountHolder: 'Seller One',
                        ifscCode: 'TEST0001'
                    },
                    termsAccepted: true
                },
                phoneNumber: '9876543210'
            },
            {
                name: 'Delivery Guy',
                email: 'delivery@example.com',
                password: hashedPassword,
                role: 'Delivery',
                vehicleDetails: {
                    vehicleType: 'Bike',
                    licensePlate: 'DL-XYZ-123'
                },
                phoneNumber: '5555555555'
            },
            {
                name: 'Support Agent',
                email: 'support@example.com',
                password: hashedPassword,
                role: 'Support',
                phoneNumber: '1111111111'
            }
        ];

        for (const u of users) {
            await User.create(u);
            console.log(`Created ${u.role}: ${u.email}`);
        }

        console.log('Database Reset Complete!');
        process.exit(0);

    } catch (error) {
        console.error('Reset failed:', error);
        process.exit(1);
    }
};

resetDB();
