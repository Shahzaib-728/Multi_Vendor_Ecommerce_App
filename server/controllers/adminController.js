import { listPendingSellers, approveSellerById, listUsers, deleteUserById, addDeliveryPartnerService, analyticsSummary, assignOrderToPartner, listAllOrdersService, getPayoutsService, settlePayoutService } from '../services/adminService.js'

export async function pendingSellers(req, res, next) {
    try {
        const result = await listPendingSellers();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function approveSeller(req, res, next) {
    try {
        const result = await approveSellerById(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function users(req, res, next) {
    try {
        const result = await listUsers();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function deleteUser(req, res, next) {
    try {
        const result = await deleteUserById(req.params.id);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function addDeliveryPartner(req, res, next) {
    try {
        const result = await addDeliveryPartnerService(req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function analytics(req, res, next) {
    try {
        const result = await analyticsSummary();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function assignOrder(req, res, next) {
    try {
        const { orderId, deliveryPartnerId } = req.body;
        // Or if route is /orders/:id/assign, then orderId is param.
        // Let's use params for orderId.
        const result = await assignOrderToPartner(req.params.id, deliveryPartnerId);
        res.json(result);
    } catch (err) {
        next(err);
    }
}
export async function getOrders(req, res, next) {
    try {
        const result = await listAllOrdersService();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function payouts(req, res, next) {
    try {
        const result = await getPayoutsService();
        res.json(result);
    } catch (err) {
        next(err);
    }
}

export async function settlePayout(req, res, next) {
    try {
        const result = await settlePayoutService(req.params.sellerId);
        res.json(result);
    } catch (err) {
        next(err);
    }
}
