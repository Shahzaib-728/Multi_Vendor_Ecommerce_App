import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export async function getCartService(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

export async function mergeCartService(userId, localItems) {
  // 1. Get existing cart
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  // 2. Merge items
  for (const localItem of localItems) {
    const existingIndex = cart.items.findIndex(i => i.product.toString() === (localItem.id || localItem.productId));
    if (existingIndex > -1) {
      // Update quantity if exists
      cart.items[existingIndex].quantity += (localItem.qty || localItem.quantity);
    } else {
      // Add new item
      cart.items.push({
        product: localItem.id || localItem.productId,
        quantity: localItem.qty || localItem.quantity
      });
    }
  }

  await cart.save();
  return await cart.populate('items.product');
}

export async function updateCartItemService(userId, productId, quantity) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const existingIndex = cart.items.findIndex(i => i.product.toString() === productId);

  if (quantity <= 0) {
    // Remove item
    if (existingIndex > -1) {
      cart.items.splice(existingIndex, 1);
    }
  } else {
    // Add or Update
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
  }

  await cart.save();
  return await cart.populate('items.product');
}

export async function clearCartService(userId) {
  await Cart.findOneAndDelete({ user: userId });
  return { success: true };
}

