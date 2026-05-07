import { Router } from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js'
import { requireRole } from '../middlewares/roleMiddleware.js'
import { create, list, get, reply, getActive, globalSearch } from '../controllers/supportController.js'

const r = Router()

// Public/Customer routes (Authenticated)
r.post('/tickets', requireAuth, create)
r.get('/active', requireAuth, getActive)
r.get('/tickets/:id', requireAuth, get)
r.post('/tickets/:id/reply', requireAuth, reply)

// Support routes (Restricted)
r.use(requireAuth, requireRole('Support'))
r.get('/tickets', list)
r.get('/search', globalSearch)
r.patch('/tickets/:id/resolve', (req, res) => res.json({ message: 'Stub' })) // For existing ticket resolution if needed

export default r
