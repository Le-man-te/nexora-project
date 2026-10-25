const repository = require('./analytics.repository');
const ApiError = require('../../utils/ApiErroir');

async function validateScope(userId, query) {
  const workspaceId = typeof query.workspaceId === 'string' ? query.workspaceId : '';
  if (!workspaceId || workspaceId.length > 36) throw ApiError.badRequest('Workspace id is required.');
  await repository.assertWorkspaceMember(userId, workspaceId);
  return workspaceId;
}

module.exports = {
  overview: async (userId, query) => repository.overview(await validateScope(userId, query)),
  trends: async (userId, query) => {
    const workspaceId = await validateScope(userId, query);
    const days = query.days === undefined ? 30 : Number(query.days);
    if (!Number.isInteger(days) || days < 1 || days > 365) throw ApiError.badRequest('Days must be between 1 and 365.');
    return repository.trends(workspaceId, days);
  },
  projects: async (userId, query) => repository.projects(await validateScope(userId, query)),
  team: async (userId, query) => repository.team(await validateScope(userId, query)),
};