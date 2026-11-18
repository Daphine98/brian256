import * as groupModel from '../models/groupModel.js'
import { findMissingFields } from '../middleware/validate.js'

const requiredGroupFields = ['name', 'courseName', 'courseCode', 'faculty', 'description', 'meetingLocation']

export async function listGroups(req, res) {
  const groups = await groupModel.searchGroups({
    course: req.query.course,
    faculty: req.query.faculty,
    title: req.query.title,
  })
  res.json({ groups })
}

export async function createNewGroup(req, res) {
  const missing = findMissingFields(req.body, requiredGroupFields)
  if (missing.length) return res.status(400).json({ message: `Please fill in: ${missing.join(', ')}` })

  const groupId = await groupModel.createGroup(req.body, req.user.id)
  const group = await groupModel.findGroupById(groupId)
  res.status(201).json({ group })
}

export async function getGroupDetails(req, res) {
  const group = await groupModel.findGroupById(req.params.groupId)
  if (!group) return res.status(404).json({ message: 'Group not found' })

  const members = await groupModel.getMembers(group.id)
  const membership = await groupModel.getMembership(group.id, req.user.id)
  // myRole is "leader", "member" or null (not joined yet)
  res.json({ group, members, myRole: membership?.role ?? null })
}

export async function editGroup(req, res) {
  const missing = findMissingFields(req.body, requiredGroupFields)
  if (missing.length) return res.status(400).json({ message: `Please fill in: ${missing.join(', ')}` })

  const membership = await groupModel.getMembership(req.params.groupId, req.user.id)
  if (membership?.role !== 'leader') return res.status(403).json({ message: 'Only the group leader can edit' })

  await groupModel.updateGroup(req.params.groupId, req.body)
  res.json({ group: await groupModel.findGroupById(req.params.groupId) })
}

export async function removeGroup(req, res) {
  const membership = await groupModel.getMembership(req.params.groupId, req.user.id)
  const isLeader = membership?.role === 'leader'
  if (!isLeader && req.user.role !== 'admin') return res.status(403).json({ message: 'Not allowed' })

  await groupModel.deleteGroup(req.params.groupId)
  res.json({ message: 'Group deleted' })
}

export async function joinGroup(req, res) {
  const group = await groupModel.findGroupById(req.params.groupId)
  if (!group) return res.status(404).json({ message: 'Group not found' })

  const alreadyMember = await groupModel.getMembership(group.id, req.user.id)
  if (alreadyMember) return res.status(409).json({ message: 'You already belong to this group' })

  await groupModel.addMember(group.id, req.user.id)
  res.status(201).json({ message: 'You joined the group' })
}

export async function leaveGroup(req, res) {
  const membership = await groupModel.getMembership(req.params.groupId, req.user.id)
  if (!membership) return res.status(404).json({ message: 'You are not in this group' })
  if (membership.role === 'leader') {
    return res.status(400).json({ message: 'Leaders cannot leave. Delete the group instead.' })
  }
  await groupModel.removeMember(req.params.groupId, req.user.id)
  res.json({ message: 'You left the group' })
}

// Leader removes an inactive member
export async function removeGroupMember(req, res) {
  const { groupId, userId } = req.params
  const membership = await groupModel.getMembership(groupId, req.user.id)
  if (membership?.role !== 'leader') return res.status(403).json({ message: 'Only the group leader can remove members' })
  if (Number(userId) === req.user.id) return res.status(400).json({ message: 'You cannot remove yourself' })

  await groupModel.removeMember(groupId, userId)
  res.json({ message: 'Member removed' })
}
