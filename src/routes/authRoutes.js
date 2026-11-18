import { Router } from 'express'
import { registerStudent, loginUser, getCurrentUser } from '../controllers/authController.js'
import { requireLogin } from '../middleware/authMiddleware.js'

const router = Router()
router.post('/register', registerStudent)
router.post('/login', loginUser)
router.get('/me', requireLogin, getCurrentUser)
export default router
