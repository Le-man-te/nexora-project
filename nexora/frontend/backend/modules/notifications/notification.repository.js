const { getPool } = require('../../database/pools');

async function list(userId, { limit = 25, offset = 0 } = {}, pool = getPool()) {
  const [items] = await pool.execute(
    `SELECT id, type, title, message, data, read_at, created_at
     FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset],
  );
  const [count] = await pool.execute(
    'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ?',
    [userId],
  );
  return { items, total: Number(count[0].total) };
}

async function unreadCount(userId, pool = getPool()) {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND read_at IS NULL',
    [userId],
  );
  return Number(rows[0].total);
}

async function markRead(userId, id, pool = getPool()) {
  const [result] = await pool.execute(
    'UPDATE notifications SET read_at = COALESCE(read_at, UTC_TIMESTAMP()) WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return result.affectedRows > 0;
}

async function markAllRead(userId, pool = getPool()) {
  const [result] = await pool.execute(
    'UPDATE notifications SET read_at = UTC_TIMESTAMP() WHERE user_id = ? AND read_at IS NULL',
    [userId],
  );
  return result.affectedRows;
}

async function remove(userId, id, pool = getPool()) {
  const [result] = await pool.execute(
    'DELETE FROM notifications WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return result.affectedRows > 0;
}

module.exports = { list, unreadCount, markRead, markAllRead, remove };