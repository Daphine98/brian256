import { Router } from 'express'
import { getStudentDashboard, getAdminDashboard } from '../controllers/dashboardController.js'
import { requireLogin, requireAdmin } from '../middleware/authMiddleware.js'

const router = Router()
router.get('/dashboard', requireLogin, getStudentDashboard)
router.get('/admin/dashboard', requireLogin, requireAdmin, getAdminDashboard)
export default router
