import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const cartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
    totalPrice: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware to calculate total price before saving
cartSchema.pre('save', async function (next) {
    // In a real app, you might want to fetch current product prices here to be safe
    // For now we assume the logic handles it or we do it elsewhere
    next();
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
