const { getPool } = require('../../database/pools');
const { withTransaction } = require('../../database/transaction');

async function getProfile(userId, pool = getPool()) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, avatar_url, created_at FROM users WHERE id = ? LIMIT 1',
    [userId],
  );
  return rows[0] || null;
}

async function updateProfile(userId, values, pool = getPool()) {
  const columns = [];
  const params = [];
  if (Object.hasOwn(values, 'name')) {
    columns.push('name = ?');
    params.push(values.name);
  }
  if (Object.hasOwn(values, 'avatarUrl')) {
    columns.push('avatar_url = ?');
    params.push(values.avatarUrl);
  }
  if (!columns.length) return getProfile(userId, pool);
  await pool.execute(`UPDATE users SET ${columns.join(', ')} WHERE id = ?`, [...params, userId]);
  return getProfile(userId, pool);
}

async function getPreferences(userId, pool = getPool()) {
  const [rows] = await pool.execute(
    'SELECT preferences FROM notification_preferences WHERE user_id = ? LIMIT 1',
    [userId],
  );
  if (!rows.length) return {};
  const raw = rows[0].preferences;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function updatePreferences(userId, patch, pool = getPool()) {
  return withTransaction(pool, async (connection) => {
    const [rows] = await connection.execute(
      'SELECT preferences FROM notification_preferences WHERE user_id = ? FOR UPDATE',
      [userId],
    );
    const existing = rows.length
      ? (typeof rows[0].preferences === 'string' ? JSON.parse(rows[0].preferences) : rows[0].preferences)
      : {};
    const updated = { ...existing, ...patch };
    await connection.execute(
      `INSERT INTO notification_preferences (user_id, preferences) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE preferences = VALUES(preferences)`,
      [userId, JSON.stringify(updated)],
    );
    return updated;
  });
}

async function listSessions(userId, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT id, created_at, expires_at FROM sessions
     WHERE user_id = ? AND expires_at > UTC_TIMESTAMP() ORDER BY created_at DESC`,
    [userId],
  );
  return rows;
}

async function revokeSession(userId, sessionId, pool = getPool()) {
  const [result] = await pool.execute('DELETE FROM sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
  return result.affectedRows > 0;
}

async function changePassword(userId, currentSessionId, passwordHash, pool = getPool()) {
  return withTransaction(pool, async (connection) => {
    const [userUpdate] = await connection.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);
    if (userUpdate.affectedRows !== 1) throw new Error('Unable to update password for the authenticated account.');
    const [result] = await connection.execute(
      'DELETE FROM sessions WHERE user_id = ? AND id <> ?',
      [userId, currentSessionId],
    );
    return result.affectedRows;
  });
}

async function getPasswordHash(userId, pool = getPool()) {
  const [rows] = await pool.execute('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows[0]?.password_hash || null;
}

module.exports = {
  getProfile, updateProfile, getPreferences, updatePreferences,
  listSessions, revokeSession, changePassword, getPasswordHash,
};