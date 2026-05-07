import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected.');

        const allProducts = await Product.find({ isActive: true });
        console.log(`Found ${allProducts.length} active products.`);

        if (allProducts.length === 0) {
            console.log('No active products found.');
            process.exit(0);
        }

        // Mark all as NOT featured first
        await Product.updateMany({}, { isFeatured: false });
        console.log('Reset all featured flags.');

        // Take up to 4 products and mark them as featured
        const toFeature = allProducts.slice(0, 4);
        const ids = toFeature.map(p => p._id);

        await Product.updateMany(
            { _id: { $in: ids } },
            { isFeatured: true }
        );

        console.log(`Successfully marked ${ids.length} products as featured:`);
        toFeature.forEach(p => console.log(`- ${p.name} (${p._id})`));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

run();
