import { findGroupsOfUser, findRecentGroups } from '../models/groupModel.js'
import { findUpcomingSessionsOfUser } from '../models/sessionModel.js'
import { getAdminStats } from '../models/statsModel.js'

// Student dashboard: my groups, upcoming sessions, recently created groups
export async function getStudentDashboard(req, res) {
  const [myGroups, upcomingSessions, recentGroups] = await Promise.all([
    findGroupsOfUser(req.user.id),
    findUpcomingSessionsOfUser(req.user.id),
    findRecentGroups(),
  ])
  res.json({ myGroups, upcomingSessions, recentGroups })
}

// Administrator dashboard: totals and most active courses
export async function getAdminDashboard(req, res) {
  res.json(await getAdminStats())
}
