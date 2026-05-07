import { listAssignedOrders, updateDeliveryStatusService, getDeliveryRevenue } from '../services/deliveryService.js'

export async function listAssigned(req, res, next) {
    try {
        const orders = await listAssignedOrders(req.user.id)
        res.json(orders)
    } catch (err) {
        next(err)
    }
}

export async function updateStatus(req, res, next) {
    try {
        const result = await updateDeliveryStatusService(req.params.id, req.body.status)
        res.json(result)
    } catch (err) {
        next(err)
    }
}
export async function getRevenue(req, res, next) {
    try {
        const data = await getDeliveryRevenue(req.user.id)
        res.json(data)
    } catch (err) {
        next(err)
    }
}
