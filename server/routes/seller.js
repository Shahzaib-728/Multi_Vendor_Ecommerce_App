import { Router } from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/roleMiddleware.js'
import { addProduct, getProducts, updateProduct, deleteProduct, getOrders, getStats } from '../controllers/sellerController.js'
const r = Router()
r.use(requireAuth, requireRole('Seller'))
r.get('/stats', getStats)
r.post('/products', addProduct)
r.get('/products', getProducts)
r.put('/products/:id', updateProduct)
r.delete('/products/:id', deleteProduct)
r.delete('/products/:id', deleteProduct)
r.get('/orders', getOrders)
r.post('/profile/request-update', (await import('../controllers/sellerController.js')).requestUpdate)
export default r

