import { db } from '../config/db.js'

export async function createUser({ name, email, passwordHash, program, yearOfStudy }) {
  const [result] = await db.query(
    'INSERT INTO users (name, email, password_hash, program, year_of_study) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, program, yearOfStudy],
  )
  return result.insertId
}

export async function findUserByEmail(email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email])
  return rows[0]
}

export async function findUserById(id) {
  const [rows] = await db.query(
    'SELECT id, name, email, program, year_of_study, role, created_at FROM users WHERE id = ?',
    [id],
  )
  return rows[0]
}
