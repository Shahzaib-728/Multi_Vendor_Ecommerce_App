import { Router } from 'express'
import { getDeliveryPartners, getAvailablePartners, getServiceCoverage } from '../controllers/userController.js'

const r = Router()

// Public route to fetch delivery partners for checkout
r.get('/delivery-partners', getDeliveryPartners)

// New: Smart filtered partners
r.get('/available-partners', getAvailablePartners)

// New: Get service coverage map
r.get('/service-coverage', getServiceCoverage)

export default r
