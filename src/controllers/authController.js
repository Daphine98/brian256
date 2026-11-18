import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createUser, findUserByEmail, findUserById } from '../models/userModel.js'
import { findMissingFields, isValidEmail } from '../middleware/validate.js'

// Create a signed token the browser sends back with every request
function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

export async function registerStudent(req, res) {
  const missing = findMissingFields(req.body, ['name', 'email', 'password', 'program', 'yearOfStudy'])
  if (missing.length) return res.status(400).json({ message: `Please fill in: ${missing.join(', ')}` })

  const { name, email, password, program, yearOfStudy } = req.body
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Enter a valid email address' })
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

  const emailAlreadyUsed = await findUserByEmail(email)
  if (emailAlreadyUsed) return res.status(409).json({ message: 'That email is already registered' })

  const passwordHash = await bcrypt.hash(password, 10) // never store plain passwords
  const newUserId = await createUser({ name, email, passwordHash, program, yearOfStudy })
  const user = await findUserById(newUserId)

  res.status(201).json({ token: createToken(user), user })
}

export async function loginUser(req, res) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })

  const user = await findUserByEmail(email)
  const passwordMatches = user && (await bcrypt.compare(password, user.password_hash))
  if (!passwordMatches) return res.status(401).json({ message: 'Wrong email or password' })

  const safeUser = await findUserById(user.id)
  res.json({ token: createToken(user), user: safeUser })
}

export async function getCurrentUser(req, res) {
  const user = await findUserById(req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ user })
}
