import { Router } from 'express'
import * as groups from '../controllers/groupController.js'
import * as sessions from '../controllers/sessionController.js'
import { requireLogin } from '../middleware/authMiddleware.js'

const router = Router()
router.use(requireLogin) // every group route needs a logged-in user

router.get('/', groups.listGroups)
router.post('/', groups.createNewGroup)
router.get('/:groupId', groups.getGroupDetails)
router.put('/:groupId', groups.editGroup)
router.delete('/:groupId', groups.removeGroup)

router.post('/:groupId/join', groups.joinGroup)
router.delete('/:groupId/leave', groups.leaveGroup)
router.delete('/:groupId/members/:userId', groups.removeGroupMember)

router.get('/:groupId/sessions', sessions.listGroupSessions)
router.post('/:groupId/sessions', sessions.scheduleSession)
router.get('/:groupId/posts', sessions.listGroupPosts)
router.post('/:groupId/posts', sessions.addGroupPost)

export default router
