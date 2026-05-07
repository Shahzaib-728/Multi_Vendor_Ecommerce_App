import { Router } from 'express'
import { register, login, updateProfile, getMe, forgotPassword, resetPassword } from '../controllers/authController.js'
import { authenticateToken } from '../middlewares/authMiddleware.js'
const r = Router()
r.get('/me', authenticateToken, getMe)
r.post('/register', register)
r.post('/login', login)
r.put('/profile', authenticateToken, updateProfile)
r.post('/forgot-password', forgotPassword)
r.post('/reset-password/:token', resetPassword)
export default r

