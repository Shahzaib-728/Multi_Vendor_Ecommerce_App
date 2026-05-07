import { listProducts, getProduct } from '../services/productService.js'

export async function getAll(req, res, next) {
    try {
        const products = await listProducts();
        res.json(products);
    } catch (err) {
        next(err);
    }
}

export async function getById(req, res, next) {
    try {
        const product = await getProduct(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        next(err);
    }
}
