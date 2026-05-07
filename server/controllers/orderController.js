import { createOrder, listCustomerOrders, updateOrderStatus, cancelOrder, getOrderById } from '../services/orderService.js'

export async function getById(req, res, next) {
    try {
        const order = await getOrderById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // Allow Admin/Support/Seller or the owning Customer
        if (req.user.role === 'Customer' && order.customer.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(order);
    } catch (err) {
        next(err);
    }
}

export async function create(req, res, next) {
    try {
        const { items, deliveryPartnerId, address, paymentId } = req.body;
        // Map frontend 'address' to 'shippingAddress' if needed, or stick to naming convention.
        // Frontend Checkout sends 'address' usually. Let's assume req.body.address.
        const order = await createOrder(req.user.id, items || [], deliveryPartnerId, address, paymentId);
        res.json(order);
    } catch (err) {
        next(err);
    }
}

export async function listMine(req, res, next) {
    try {
        const orders = await listCustomerOrders(req.user.id);
        res.json(orders);
    } catch (err) {
        next(err);
    }
}

export async function updateStatus(req, res, next) {
    try {
        const order = await updateOrderStatus(req.params.id, req.body.status);
        res.json(order);
    } catch (err) {
        next(err);
    }
}

export async function cancel(req, res, next) {
    try {
        const order = await cancelOrder(req.params.id, req.user.id);
        res.json(order);
    } catch (err) {
        next(err);
    }
}
