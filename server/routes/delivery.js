import { Router } from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/roleMiddleware.js'
import { listAssigned, updateStatus, getRevenue } from '../controllers/deliveryController.js'
const r = Router()
r.use(requireAuth, requireRole('Delivery'))
r.get('/orders', listAssigned)
r.get('/revenue', getRevenue)
r.put('/orders/:id', updateStatus)
export default r
