import { db } from '../config/db.js'

// Numbers shown on the administrator dashboard
export async function getAdminStats() {
  const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users')
  const [[{ totalGroups }]] = await db.query('SELECT COUNT(*) AS totalGroups FROM study_groups')
  const [[{ totalSessions }]] = await db.query('SELECT COUNT(*) AS totalSessions FROM study_sessions')
  const [activeCourses] = await db.query(
    `SELECT course_name, course_code, COUNT(*) AS group_count
     FROM study_groups GROUP BY course_name, course_code
     ORDER BY group_count DESC LIMIT 5`,
  )
  const [recentUsers] = await db.query(
    'SELECT id, name, email, program, role, created_at FROM users ORDER BY created_at DESC LIMIT 6',
  )
  return { totalUsers, totalGroups, totalSessions, activeCourses, recentUsers }
}
