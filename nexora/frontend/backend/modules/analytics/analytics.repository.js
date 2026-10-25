const { getPool } = require('../../database/pools');
const ApiError = require('../../utils/ApiErroir');

async function assertWorkspaceMember(userId, workspaceId, pool = getPool()) {
  const [rows] = await pool.execute(
    'SELECT 1 FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1',
    [workspaceId, userId],
  );
  if (!rows.length) throw ApiError.notFound('Workspace not found.');
}

async function overview(workspaceId, pool = getPool()) {
  const [[projects]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM projects WHERE workspace_id = ? AND archived_at IS NULL',
    [workspaceId],
  );
  const [[tasks]] = await pool.execute(
    `SELECT COUNT(*) AS total,
       SUM(status = 'done') AS completed,
       SUM(status <> 'done') AS open
     FROM tasks t JOIN projects p ON p.id = t.project_id
     WHERE p.workspace_id = ? AND p.archived_at IS NULL`,
    [workspaceId],
  );
  const [[members]] = await pool.execute(
    'SELECT COUNT(*) AS total FROM workspace_members WHERE workspace_id = ?',
    [workspaceId],
  );
  return {
    projects: Number(projects.total),
    tasks: { total: Number(tasks.total || 0), completed: Number(tasks.completed || 0), open: Number(tasks.open || 0) },
    members: Number(members.total),
  };
}

async function trends(workspaceId, days, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT DATE(t.created_at) AS date, COUNT(*) AS created,
       SUM(t.status = 'done') AS completed
     FROM tasks t JOIN projects p ON p.id = t.project_id
     WHERE p.workspace_id = ? AND t.created_at >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? DAY)
     GROUP BY DATE(t.created_at) ORDER BY date`,
    [workspaceId, days],
  );
  return rows;
}

async function projects(workspaceId, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT p.id, p.name, p.status, p.priority, COUNT(t.id) AS task_count,
       SUM(t.status = 'done') AS completed_tasks
     FROM projects p LEFT JOIN tasks t ON t.project_id = p.id
     WHERE p.workspace_id = ? AND p.archived_at IS NULL
     GROUP BY p.id ORDER BY p.updated_at DESC`,
    [workspaceId],
  );
  return rows;
}

async function team(workspaceId, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.name, wm.role, COUNT(t.id) AS assigned_tasks,
       SUM(t.status = 'done') AS completed_tasks
     FROM workspace_members wm JOIN users u ON u.id = wm.user_id
     LEFT JOIN projects p ON p.workspace_id = wm.workspace_id
     LEFT JOIN tasks t ON t.project_id = p.id AND t.assigned_to = u.id
     WHERE wm.workspace_id = ? GROUP BY u.id, u.name, wm.role ORDER BY u.name`,
    [workspaceId],
  );
  return rows;
}

module.exports = { assertWorkspaceMember, overview, trends, projects, team };