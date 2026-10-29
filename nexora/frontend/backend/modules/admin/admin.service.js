const { getMongoDatabase } = require('../../database/mongo');
const ApiError = require('../../utils/ApiErroir');

const UUID_PATTERN = /^[0-9a-f-]{36}$/i;

async function getWorkspaceSummary(userId, workspaceId, database = getMongoDatabase()) {
  if (typeof workspaceId !== 'string' || !UUID_PATTERN.test(workspaceId)) {
    throw ApiError.badRequest('Workspace id is invalid.');
  }
  const membership = await database.collection('workspace_members').findOne({
    workspace_id: workspaceId,
    user_id: userId,
  });
  if (!membership) throw ApiError.notFound('Workspace not found.');
  if (!['owner', 'admin'].includes(membership.role)) throw ApiError.forbidden();
  const projectIds = await database.collection('projects').distinct('id', { workspace_id: workspaceId });
  const [projectCount, taskCount, memberCount] = await Promise.all([
    database.collection('projects').countDocuments({ workspace_id: workspaceId }),
    database.collection('tasks').countDocuments({ project_id: { $in: projectIds } }),
    database.collection('workspace_members').countDocuments({ workspace_id: workspaceId }),
  ]);
  return {
    workspaceId,
    projects: projectCount,
    tasks: taskCount,
    members: memberCount,
  };
}

async function getPlatformOverview(database = getMongoDatabase()) {
  const [users, workspaces, userCount, workspaceCount, projectCount, taskCount] = await Promise.all([
    database.collection('users')
      .find({}, { projection: { _id: 0, id: 1, name: 1, email: 1, global_role: 1, disabled_at: 1, created_at: 1 } })
      .sort({ created_at: -1 })
      .limit(100)
      .toArray(),
    database.collection('workspaces')
      .find({}, { projection: { _id: 0, id: 1, name: 1, slug: 1, created_by: 1, archived_at: 1, created_at: 1 } })
      .sort({ created_at: -1 })
      .limit(100)
      .toArray(),
    database.collection('users').countDocuments(),
    database.collection('workspaces').countDocuments(),
    database.collection('projects').countDocuments(),
    database.collection('tasks').countDocuments(),
  ]);
  const ownerIds = [...new Set(workspaces.map((workspace) => workspace.created_by).filter(Boolean))];
  const owners = ownerIds.length
    ? await database.collection('users')
      .find({ id: { $in: ownerIds } }, { projection: { _id: 0, id: 1, name: 1, email: 1 } })
      .toArray()
    : [];
  const ownerById = new Map(owners.map((owner) => [owner.id, owner]));
  return {
    counts: { users: userCount, workspaces: workspaceCount, projects: projectCount, tasks: taskCount },
    users,
    workspaces: workspaces.map((workspace) => ({
      ...workspace,
      owner_name: ownerById.get(workspace.created_by)?.name || null,
      owner_email: ownerById.get(workspace.created_by)?.email || null,
    })),
  };
}

async function setUserDisabled(adminUserId, userId, disabled, database = getMongoDatabase()) {
  if (typeof userId !== 'string' || !UUID_PATTERN.test(userId)) throw ApiError.badRequest('User id is invalid.');
  if (typeof disabled !== 'boolean') throw ApiError.badRequest('Disabled must be true or false.');
  if (adminUserId === userId && disabled) throw ApiError.badRequest('You cannot disable your own administrator account.');

  const user = await database.collection('users').findOne(
    { id: userId },
    { projection: { _id: 0, id: 1, global_role: 1 } },
  );
  if (!user) throw ApiError.notFound('User not found.');
  if (user.global_role === 'platform_admin') {
    throw ApiError.badRequest('Platform administrator accounts cannot be disabled here.');
  }

  await database.collection('users').updateOne(
    { id: userId },
    { $set: { disabled_at: disabled ? new Date() : null, updated_at: new Date() } },
  );
  if (disabled) await database.collection('sessions').deleteMany({ user_id: userId });
  return { id: userId, disabled };
}

async function setWorkspaceArchived(workspaceId, archived, database = getMongoDatabase()) {
  if (typeof workspaceId !== 'string' || !UUID_PATTERN.test(workspaceId)) {
    throw ApiError.badRequest('Workspace id is invalid.');
  }
  if (typeof archived !== 'boolean') throw ApiError.badRequest('Archived must be true or false.');
  const workspace = await database.collection('workspaces').findOne(
    { id: workspaceId },
    { projection: { _id: 0, id: 1 } },
  );
  if (!workspace) throw ApiError.notFound('Workspace not found.');

  await database.collection('workspaces').updateOne(
    { id: workspaceId },
    { $set: { archived_at: archived ? new Date() : null, updated_at: new Date() } },
  );
  return { id: workspaceId, archived };
}

module.exports = { getWorkspaceSummary, getPlatformOverview, setUserDisabled, setWorkspaceArchived };