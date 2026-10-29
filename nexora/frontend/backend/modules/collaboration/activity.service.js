const { getMongoDatabase } = require('../../database/mongo');
const ApiError = require('../../utils/ApiErroir');
const { parsePagination } = require('../../utils/pagination');

async function list(userId, query = {}, database = getMongoDatabase()) {
  const workspaceId = typeof query.workspaceId === 'string' ? query.workspaceId : '';
  if (!workspaceId) throw ApiError.badRequest('Workspace id is required.');
  const { limit, offset } = parsePagination(query);
  const membership = await database.collection('workspace_members').findOne({
    workspace_id: workspaceId,
    user_id: userId,
  });
  if (!membership) throw ApiError.notFound('Workspace not found.');
  const rows = await database.collection('activity_logs')
    .find({ workspace_id: workspaceId })
    .project({ _id: 0 })
    .sort({ created_at: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();
  const actorIds = rows.map(({ actor_id }) => actor_id).filter(Boolean);
  const users = await database.collection('users').find({ id: { $in: actorIds } })
    .project({ _id: 0, id: 1, name: 1 }).toArray();
  const names = new Map(users.map(({ id, name }) => [id, name]));
  return rows.map(({ actor_id, ...row }) => ({
    ...row,
    actor_id: actor_id || null,
    actor_name: names.get(actor_id) || null,
  }));
}

module.exports = { list };