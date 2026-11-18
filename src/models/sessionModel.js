import { db } from '../config/db.js'

export async function createSession(groupId, createdBy, { title, sessionDate, sessionTime, locationOrLink, description }) {
  const [result] = await db.query(
    `INSERT INTO study_sessions (group_id, created_by, title, session_date, session_time, location_or_link, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [groupId, createdBy, title, sessionDate, sessionTime, locationOrLink, description],
  )
  return result.insertId
}

export async function findSessionsOfGroup(groupId) {
  const [rows] = await db.query(
    'SELECT * FROM study_sessions WHERE group_id = ? ORDER BY session_date, session_time',
    [groupId],
  )
  return rows
}

export async function findSessionById(sessionId) {
  const [rows] = await db.query('SELECT * FROM study_sessions WHERE id = ?', [sessionId])
  return rows[0]
}

export async function deleteSession(sessionId) {
  await db.query('DELETE FROM study_sessions WHERE id = ?', [sessionId])
}

// Upcoming sessions across every group the user belongs to
export async function findUpcomingSessionsOfUser(userId, limit = 6) {
  const [rows] = await db.query(
    `SELECT s.*, g.name AS group_name
     FROM study_sessions s
     JOIN study_groups g ON g.id = s.group_id
     JOIN group_members gm ON gm.group_id = g.id AND gm.user_id = ?
     WHERE TIMESTAMP(s.session_date, s.session_time) >= NOW()
     ORDER BY s.session_date, s.session_time LIMIT ?`,
    [userId, limit],
  )
  return rows
}
