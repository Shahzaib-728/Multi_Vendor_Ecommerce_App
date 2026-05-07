import { Router } from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js'
import { create, listMine, updateStatus, cancel, getById } from '../controllers/orderController.js'
const r = Router()
r.use(requireAuth)
r.post('/', create)
r.get('/', listMine)
r.get('/:id', getById)
r.put('/:id', updateStatus)
r.post('/:id/cancel', cancel)
export default r

