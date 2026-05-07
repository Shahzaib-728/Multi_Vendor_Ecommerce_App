import mongoose from 'mongoose';
import Product from './models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce-multi-role');
        console.log('Connected');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const check = async () => {
    await connectDB();
    const products = await Product.find({});
    console.log('Total Products:', products.length);
    console.log(JSON.stringify(products, null, 2));
    process.exit();
};

check();
