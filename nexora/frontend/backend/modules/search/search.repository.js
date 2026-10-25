const { getPool } = require('../../database/pools');

async function search(userId, term, type, pool = getPool()) {
  const pattern = `%${term}%`;
  const searches = [];
  if (!type || type === 'project') {
    const [rows] = await pool.execute(
      `SELECT p.id, 'Project' AS type, p.name AS title, p.description
       FROM projects p JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
       WHERE wm.user_id = ? AND p.archived_at IS NULL AND (p.name LIKE ? OR p.description LIKE ?)
       LIMIT 25`,
      [userId, pattern, pattern],
    );
    searches.push(...rows);
  }
  if (!type || type === 'workspace') {
    const [rows] = await pool.execute(
      `SELECT w.id, 'Workspace' AS type, w.name AS title, w.description
       FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id
       WHERE wm.user_id = ? AND w.archived_at IS NULL AND (w.name LIKE ? OR w.description LIKE ?)
       LIMIT 25`,
      [userId, pattern, pattern],
    );
    searches.push(...rows);
  }
  if (!type || type === 'task') {
    const [rows] = await pool.execute(
      `SELECT t.id, 'Task' AS type, t.title, t.description
       FROM tasks t JOIN projects p ON p.id = t.project_id
       JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
       WHERE wm.user_id = ? AND (t.title LIKE ? OR t.description LIKE ?)
       LIMIT 25`,
      [userId, pattern, pattern],
    );
    searches.push(...rows);
  }
  return searches.map(({ id, type: resultType, title, description }) => ({
    id,
    type: resultType,
    title,
    description: description || '',
  }));
}

module.exports = { search };