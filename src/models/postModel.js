import { db } from '../config/db.js'

export async function createPost(groupId, userId, { type, content }) {
  const [result] = await db.query(
    'INSERT INTO posts (group_id, user_id, type, content) VALUES (?, ?, ?, ?)',
    [groupId, userId, type, content],
  )
  return result.insertId
}

export async function findPostsOfGroup(groupId) {
  const [rows] = await db.query(
    `SELECT p.*, u.name AS author_name
     FROM posts p JOIN users u ON u.id = p.user_id
     WHERE p.group_id = ? ORDER BY p.created_at DESC`,
    [groupId],
  )
  return rows
}
