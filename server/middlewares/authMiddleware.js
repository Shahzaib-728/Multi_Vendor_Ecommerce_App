import { verifyToken } from '../utils/jwt.js'

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  req.user = payload
  next()
}

export const authenticateToken = requireAuth
