import { Router } from 'express'
import { cancelSession } from '../controllers/sessionController.js'
import { requireLogin } from '../middleware/authMiddleware.js'

const router = Router()
router.delete('/:sessionId', requireLogin, cancelSession)
export default router
