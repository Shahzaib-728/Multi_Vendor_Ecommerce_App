import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function updateFeaturedProducts() {
    try {
        if (!MONGO_URI) {
            console.error('MONGO_URI not found in environment');
            process.exit(1);
        }
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Get the first 4 active products
        const products = await Product.find({ isActive: true }).limit(4);

        if (products.length === 0) {
            console.log('No active products found to mark as featured.');
            process.exit(0);
        }

        const productIds = products.map(p => p._id);

        // Reset all featured products
        await Product.updateMany({}, { isFeatured: false });

        // Mark these 4 as featured
        await Product.updateMany(
            { _id: { $in: productIds } },
            { isFeatured: true }
        );

        console.log(`Successfully marked ${productIds.length} products as featured:`, productIds);
        process.exit(0);
    } catch (error) {
        console.error('Error updating products:', error);
        process.exit(1);
    }
}

updateFeaturedProducts();
