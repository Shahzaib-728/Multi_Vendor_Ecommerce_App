import { getCartService, mergeCartService, updateCartItemService, clearCartService } from '../services/cartService.js'

export async function getCart(req, res, next) {
    try {
        const cart = await getCartService(req.user.id);
        res.json(cart);
    } catch (err) { next(err) }
}

export async function merge(req, res, next) {
    try {
        const cart = await mergeCartService(req.user.id, req.body.items || []);
        res.json(cart);
    } catch (err) { next(err) }
}

export async function updateItem(req, res, next) {
    try {
        const { productId, quantity } = req.body;
        const cart = await updateCartItemService(req.user.id, productId, quantity);
        res.json(cart);
    } catch (err) { next(err) }
}

export async function clear(req, res, next) {
    try {
        await clearCartService(req.user.id);
        res.json({ success: true });
    } catch (err) { next(err) }
}

