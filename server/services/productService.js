import Product from '../models/Product.js';
import Review from '../models/Review.js'; // Ensure Review model is registered

export async function listProducts() {
    return await Product.find({ isActive: true })
        .populate('seller', 'name storeDetails')
        .select('-description -images')
        .lean();
}

export async function getProduct(id) {
    try {
        return await Product.findById(id)
            .populate('seller', 'name storeDetails')
            .populate('reviews')
            .lean();
    } catch (error) {
        console.error("Error in getProduct:", error);
        throw error;
    }
}

export async function createProduct(productData) {
    const product = new Product(productData);
    return await product.save();
}
