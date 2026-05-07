import { Router } from 'express'
import { getAll, getById } from '../controllers/productController.js'
const r = Router()
r.get('/', getAll)
r.get('/:id', getById)
export default r

