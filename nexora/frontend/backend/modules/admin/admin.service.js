const { getPool } = require('../../database/pools');
const ApiError = require('../../utils/ApiErroir');

async function getWorkspaceSummary(userId, workspaceId, pool = getPool()) {
  if (typeof workspaceId !== 'string' || !/^[0-9a-f-]{36}$/i.test(workspaceId)) {
    throw ApiError.badRequest('Workspace id is invalid.');
  }
  const [members] = await pool.execute(
    `SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1`,
    [workspaceId, userId],
  );
  if (!members.length) throw ApiError.notFound('Workspace not found.');
  if (!['owner', 'admin'].includes(members[0].role)) throw ApiError.forbidden();
  const [[projectCount]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM projects WHERE workspace_id = ?',
    [workspaceId],
  );
  const [[taskCount]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM tasks t JOIN projects p ON p.id = t.project_id
     WHERE p.workspace_id = ?`,
    [workspaceId],
  );
  const [[memberCount]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM workspace_members WHERE workspace_id = ?',
    [workspaceId],
  );
  return {
    workspaceId,
    projects: Number(projectCount.total),
    tasks: Number(taskCount.total),
    members: Number(memberCount.total),
  };
}

module.exports = { getWorkspaceSummary };