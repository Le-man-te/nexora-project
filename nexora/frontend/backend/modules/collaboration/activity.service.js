const { getPool } = require('../../database/pools');
const ApiError = require('../../utils/ApiErroir');
const { parsePagination } = require('../../utils/pagination');

async function list(userId, query = {}, pool = getPool()) {
  const workspaceId = typeof query.workspaceId === 'string' ? query.workspaceId : '';
  if (!workspaceId) throw ApiError.badRequest('Workspace id is required.');
  const { limit, offset } = parsePagination(query);
  const [rows] = await pool.execute(
    `SELECT a.id, a.action, a.entity_type, a.entity_id, a.metadata, a.created_at,
            u.id AS actor_id, u.name AS actor_name
     FROM activity_logs a
     JOIN workspace_members wm ON wm.workspace_id = a.workspace_id AND wm.user_id = ?
     LEFT JOIN users u ON u.id = a.actor_id
     WHERE a.workspace_id = ? ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [userId, workspaceId, limit, offset],
  );
  return rows;
}

module.exports = { list };