const { randomUUID } = require('node:crypto');
const { getPool } = require('../../database/pools');
const { withTransaction } = require('../../database/transaction');

async function findUserByEmail(email, pool = getPool()) {
  const [rows] = await pool.execute('SELECT id, name, email FROM users WHERE email = ? LIMIT 1', [email]);
  return rows[0] || null;
}

async function createResetToken(userId, tokenHash, expiresAt, pool = getPool()) {
  await pool.execute(
    'DELETE FROM password_reset_tokens WHERE user_id = ? AND used_at IS NULL',
    [userId],
  );
  await pool.execute(
    `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
     VALUES (?, ?, ?, ?)`,
    [randomUUID(), userId, tokenHash, expiresAt],
  );
}

async function resetPassword(tokenHash, passwordHash, pool = getPool()) {
  return withTransaction(pool, async (connection) => {
    const [rows] = await connection.execute(
      `SELECT id, user_id FROM password_reset_tokens
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > UTC_TIMESTAMP()
       FOR UPDATE`,
      [tokenHash],
    );
    if (rows.length === 0) return false;
    const resetToken = rows[0];
    await connection.execute('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, resetToken.user_id]);
    await connection.execute('DELETE FROM sessions WHERE user_id = ?', [resetToken.user_id]);
    await connection.execute(
      'UPDATE password_reset_tokens SET used_at = UTC_TIMESTAMP() WHERE id = ?',
      [resetToken.id],
    );
    return true;
  });
}

module.exports = { findUserByEmail, createResetToken, resetPassword };