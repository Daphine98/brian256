import { db } from '../config/db.js'

// Base query: a group together with its leader's name and member count
const groupSelect = `
  SELECT g.*, u.name AS leader_name,
         (SELECT COUNT(*) FROM group_members gm WHERE gm.group_id = g.id) AS member_count
  FROM study_groups g
  JOIN users u ON u.id = g.leader_id`

export async function createGroup(group, leaderId) {
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    const [result] = await connection.query(
      `INSERT INTO study_groups (name, course_name, course_code, faculty, description, meeting_location, leader_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [group.name, group.courseName, group.courseCode, group.faculty, group.description, group.meetingLocation, leaderId],
    )
    // The creator automatically becomes the group leader
    await connection.query(
      "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'leader')",
      [result.insertId, leaderId],
    )
    await connection.commit()
    return result.insertId
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Filters: course name/code, faculty and group title (all optional)
export async function searchGroups({ course, faculty, title }) {
  const conditions = []
  const values = []
  if (course) {
    conditions.push('(g.course_name LIKE ? OR g.course_code LIKE ?)')
    values.push(`%${course}%`, `%${course}%`)
  }
  if (faculty) {
    conditions.push('g.faculty = ?')
    values.push(faculty)
  }
  if (title) {
    conditions.push('g.name LIKE ?')
    values.push(`%${title}%`)
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const [rows] = await db.query(`${groupSelect} ${whereClause} ORDER BY g.created_at DESC`, values)
  return rows
}

export async function findGroupById(groupId) {
  const [rows] = await db.query(`${groupSelect} WHERE g.id = ?`, [groupId])
  return rows[0]
}

export async function updateGroup(groupId, group) {
  await db.query(
    `UPDATE study_groups SET name = ?, course_name = ?, course_code = ?, faculty = ?,
            description = ?, meeting_location = ? WHERE id = ?`,
    [group.name, group.courseName, group.courseCode, group.faculty, group.description, group.meetingLocation, groupId],
  )
}

export async function deleteGroup(groupId) {
  await db.query('DELETE FROM study_groups WHERE id = ?', [groupId])
}

export async function getMembers(groupId) {
  const [rows] = await db.query(
    `SELECT u.id, u.name, u.program, u.year_of_study, gm.role, gm.joined_at
     FROM group_members gm JOIN users u ON u.id = gm.user_id
     WHERE gm.group_id = ? ORDER BY gm.role = 'leader' DESC, gm.joined_at`,
    [groupId],
  )
  return rows
}

export async function getMembership(groupId, userId) {
  const [rows] = await db.query(
    'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
    [groupId, userId],
  )
  return rows[0]
}

export async function addMember(groupId, userId) {
  await db.query('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)', [groupId, userId])
}

export async function removeMember(groupId, userId) {
  await db.query('DELETE FROM group_members WHERE group_id = ? AND user_id = ?', [groupId, userId])
}

export async function findGroupsOfUser(userId) {
  const [rows] = await db.query(
    `${groupSelect} WHERE g.id IN (SELECT group_id FROM group_members WHERE user_id = ?)
     ORDER BY g.created_at DESC`,
    [userId],
  )
  return rows
}

export async function findRecentGroups(limit = 6) {
  const [rows] = await db.query(`${groupSelect} ORDER BY g.created_at DESC LIMIT ?`, [limit])
  return rows
}
