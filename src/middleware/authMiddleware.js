// Protects routes using a JWT sent as "Authorization: Bearer <token>".
import jwt from 'jsonwebtoken'

export function requireLogin(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Please log in first' })

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET) // { id, role }
    next()
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Administrators only' })
  }
  next()
}
