const { randomUUID } = require('node:crypto');
const { getPool } = require('../../database/pools');
const { withTransaction } = require('../../database/transaction');

async function list(userId, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT w.*, wm.role FROM workspaces w
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE wm.user_id = ? AND w.archived_at IS NULL ORDER BY w.created_at`,
    [userId],
  );
  return rows;
}

async function get(userId, workspaceId, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT w.*, wm.role FROM workspaces w
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE wm.user_id = ? AND w.id = ? LIMIT 1`,
    [userId, workspaceId],
  );
  return rows[0] || null;
}

async function create(userId, values, pool = getPool()) {
  const id = randomUUID();
  await withTransaction(pool, async (connection) => {
    await connection.execute(
      `INSERT INTO workspaces (id, name, slug, description, team_size, visibility, member_invites, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, values.name, values.slug, values.description, values.teamSize, values.visibility, values.memberInvites, userId],
    );
    await connection.execute(
      "INSERT INTO workspace_members (id, workspace_id, user_id, role) VALUES (?, ?, ?, 'owner')",
      [randomUUID(), id, userId],
    );
  });
  return get(userId, id, pool);
}

async function update(workspaceId, values, pool = getPool()) {
  const columns = {
    name: 'name',
    slug: 'slug',
    description: 'description',
    teamSize: 'team_size',
    visibility: 'visibility',
    memberInvites: 'member_invites',
  };
  const updates = [];
  const parameters = [];
  for (const [key, column] of Object.entries(columns)) {
    if (!Object.hasOwn(values, key)) continue;
    updates.push(`\`${column}\` = ?`);
    parameters.push(values[key]);
  }
  await pool.execute(`UPDATE workspaces SET ${updates.join(', ')} WHERE id = ?`, [...parameters, workspaceId]);
}

async function setArchived(workspaceId, archived, pool = getPool()) {
  await pool.execute(
    'UPDATE workspaces SET archived_at = ? WHERE id = ?',
    [archived ? new Date() : null, workspaceId],
  );
}

async function remove(workspaceId, pool = getPool()) {
  const [result] = await pool.execute('DELETE FROM workspaces WHERE id = ?', [workspaceId]);
  return result.affectedRows > 0;
}

async function members(workspaceId, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.avatar_url, wm.role, wm.created_at
     FROM workspace_members wm JOIN users u ON u.id = wm.user_id
     WHERE wm.workspace_id = ? ORDER BY wm.created_at`,
    [workspaceId],
  );
  return rows;
}

module.exports = { list, get, create, update, setArchived, remove, members };