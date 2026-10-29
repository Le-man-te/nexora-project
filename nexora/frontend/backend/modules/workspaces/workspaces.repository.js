const { randomUUID } = require('node:crypto');
const { getMongoDatabase } = require('../../database/mongo');
const { removeWorkspace } = require('../../database/cleanup');

async function list(userId, database = getMongoDatabase()) {
  const memberships = await database.collection('workspace_members').find({ user_id: userId }).toArray();
  const roles = new Map(memberships.map(({ workspace_id, role }) => [workspace_id, role]));
  const rows = await database.collection('workspaces')
    .find({ id: { $in: [...roles.keys()] }, archived_at: null })
    .project({ _id: 0 })
    .sort({ created_at: 1 })
    .toArray();
  return rows.map((workspace) => ({ ...workspace, role: roles.get(workspace.id) }));
}

async function get(userId, workspaceId, database = getMongoDatabase()) {
  const membership = await database.collection('workspace_members').findOne({
    user_id: userId,
    workspace_id: workspaceId,
  });
  const workspace = membership && await database.collection('workspaces').findOne(
    { id: workspaceId },
    { projection: { _id: 0 } },
  );
  return workspace ? { ...workspace, role: membership.role } : null;
}

async function create(userId, values, database = getMongoDatabase()) {
  const id = randomUUID();
  const now = new Date();
  await database.collection('workspaces').insertOne({
    id,
    name: values.name,
    slug: values.slug,
    description: values.description,
    team_size: values.teamSize,
    visibility: values.visibility,
    member_invites: Boolean(values.memberInvites),
    created_by: userId,
    archived_at: null,
    created_at: now,
    updated_at: now,
  });
  try {
    await database.collection('workspace_members').insertOne({
      id: randomUUID(),
      workspace_id: id,
      user_id: userId,
      role: 'owner',
      created_at: now,
    });
  } catch (error) {
    await database.collection('workspaces').deleteOne({ id });
    throw error;
  }
  return get(userId, id, database);
}

async function update(workspaceId, values, database = getMongoDatabase()) {
  const columns = {
    name: 'name',
    slug: 'slug',
    description: 'description',
    teamSize: 'team_size',
    visibility: 'visibility',
    memberInvites: 'member_invites',
  };
  const updates = Object.fromEntries(
    Object.entries(columns)
      .filter(([key]) => Object.hasOwn(values, key))
      .map(([key, column]) => [column, key === 'memberInvites' ? Boolean(values[key]) : values[key]]),
  );
  if (Object.keys(updates).length) {
    updates.updated_at = new Date();
    await database.collection('workspaces').updateOne({ id: workspaceId }, { $set: updates });
  }
}

async function setArchived(workspaceId, archived, database = getMongoDatabase()) {
  await database.collection('workspaces').updateOne(
    { id: workspaceId },
    { $set: { archived_at: archived ? new Date() : null, updated_at: new Date() } },
  );
}

async function remove(workspaceId, database = getMongoDatabase()) {
  const exists = await database.collection('workspaces').countDocuments({ id: workspaceId });
  if (!exists) return false;
  await removeWorkspace(database, workspaceId);
  return true;
}

async function members(workspaceId, database = getMongoDatabase()) {
  const memberships = await database.collection('workspace_members')
    .find({ workspace_id: workspaceId })
    .sort({ created_at: 1 })
    .toArray();
  const users = await database.collection('users').find({
    id: { $in: memberships.map(({ user_id }) => user_id) },
  }).project({ _id: 0, id: 1, name: 1, email: 1, avatar_url: 1 }).toArray();
  const byId = new Map(users.map((user) => [user.id, user]));
  return memberships.flatMap(({ user_id, role, created_at }) => {
    const user = byId.get(user_id);
    return user ? [{ ...user, role, created_at }] : [];
  });
}

module.exports = { list, get, create, update, setArchived, remove, members };