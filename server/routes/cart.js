import { Router } from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js'
import { merge, getCart, updateItem, clear } from '../controllers/cartController.js'
const r = Router()
r.use(requireAuth)
r.get('/', getCart)
r.post('/merge', merge)
r.post('/item', updateItem)
r.delete('/', clear)
export default r

