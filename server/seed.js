import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const seedUsers = async () => {
    try {
        await connectDB();

        // Clear existing users? Maybe better not to, just check if they exist.
        // But for a clean "How to login" state, let's upsert or check.

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
                storeDetails: {
                    storeName: 'Best Deals Store',
                    storeDescription: 'All kinds of electronics',
                    gstNumber: 'GST12345',
                    bankAccount: 'BANK12345'
                },
                phoneNumber: '9876543210'
            },
            {
                name: 'Delivery Guy',
                email: 'delivery@example.com',
                password: hashedPassword,
                role: 'Delivery',
                vehicleDetails: {
                    vehicleType: String,
                    licensePlate: String
                },

                // New: Service Areas for Smart Matching
                serviceAreas: [String], // Array of Cities/Provinces e.g., ["Lahore", "Punjab"]

                // New: Check if profile is filled before accepting orders
                isProfileComplete: { type: Boolean, default: false },
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
            const exist = await User.findOne({ email: u.email });
            if (!exist) {
                await User.create(u);
                console.log(`Created ${u.role}: ${u.email}`);
            } else {
                console.log(`User ${u.email} already exists`);
            }
        }

        console.log('Seeding complete!');
        process.exit(0);

    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedUsers();
