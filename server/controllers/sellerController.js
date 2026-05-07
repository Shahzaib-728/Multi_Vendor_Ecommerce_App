import { addSellerProduct, listSellerProducts, removeSellerProduct, updateSellerProduct } from '../services/sellerService.js'
import { listSellerOrders } from '../services/orderService.js'

export async function addProduct(req, res, next) {
    try {
        const product = await addSellerProduct(req.user.id, req.body);
        res.json(product);
    } catch (err) {
        next(err);
    }
}

export async function getProducts(req, res, next) {
    try {
        const products = await listSellerProducts(req.user.id);
        res.json(products);
    } catch (err) {
        next(err);
    }
}

export async function updateProduct(req, res, next) {
    try {
        const product = await updateSellerProduct(req.user.id, req.params.id, req.body);
        res.json(product);
    } catch (err) {
        next(err);
    }
}

export async function deleteProduct(req, res, next) {
    try {
        const result = await removeSellerProduct(req.user.id, req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function getOrders(req, res, next) {
    try {
        const orders = await listSellerOrders(req.user.id);
        res.json(orders);
    } catch (err) {
        next(err);
    }
}

export async function requestUpdate(req, res, next) {
    try {
        const User = (await import('../services/sellerService.js')).requestSellerProfileUpdate;
        const result = await User(req.user.id, req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
}


export async function getStats(req, res, next) {
    try {
        const { getSellerStats } = await import('../services/sellerService.js');
        const stats = await getSellerStats(req.user.id);
        res.json(stats);
    } catch (err) {
        next(err);
    }
}
