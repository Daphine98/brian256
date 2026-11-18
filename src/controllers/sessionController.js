import * as sessionModel from '../models/sessionModel.js'
import * as postModel from '../models/postModel.js'
import { getMembership } from '../models/groupModel.js'
import { findMissingFields } from '../middleware/validate.js'

// Study sessions ------------------------------------------------------------
export async function listGroupSessions(req, res) {
  const membership = await getMembership(req.params.groupId, req.user.id)
  if (!membership) return res.status(403).json({ message: 'Join the group to see its sessions' })
  res.json({ sessions: await sessionModel.findSessionsOfGroup(req.params.groupId) })
}

export async function scheduleSession(req, res) {
  const membership = await getMembership(req.params.groupId, req.user.id)
  if (membership?.role !== 'leader') return res.status(403).json({ message: 'Only the group leader can schedule sessions' })

  const missing = findMissingFields(req.body, ['title', 'sessionDate', 'sessionTime', 'locationOrLink'])
  if (missing.length) return res.status(400).json({ message: `Please fill in: ${missing.join(', ')}` })

  const sessionId = await sessionModel.createSession(req.params.groupId, req.user.id, req.body)
  res.status(201).json({ session: await sessionModel.findSessionById(sessionId) })
}

export async function cancelSession(req, res) {
  const session = await sessionModel.findSessionById(req.params.sessionId)
  if (!session) return res.status(404).json({ message: 'Session not found' })

  const membership = await getMembership(session.group_id, req.user.id)
  if (membership?.role !== 'leader') return res.status(403).json({ message: 'Only the group leader can cancel sessions' })

  await sessionModel.deleteSession(session.id)
  res.json({ message: 'Session cancelled' })
}

// Group communication (posts) ------------------------------------------------
export async function listGroupPosts(req, res) {
  const membership = await getMembership(req.params.groupId, req.user.id)
  if (!membership) return res.status(403).json({ message: 'Join the group to read its posts' })
  res.json({ posts: await postModel.findPostsOfGroup(req.params.groupId) })
}

export async function addGroupPost(req, res) {
  const membership = await getMembership(req.params.groupId, req.user.id)
  if (!membership) return res.status(403).json({ message: 'Join the group to post' })

  const allowedTypes = ['announcement', 'question', 'meeting']
  const { type, content } = req.body
  if (!allowedTypes.includes(type) || !String(content ?? '').trim()) {
    return res.status(400).json({ message: 'A post needs a valid type and some text' })
  }
  await postModel.createPost(req.params.groupId, req.user.id, { type, content: content.trim() })
  res.status(201).json({ message: 'Posted' })
}
