const { createHash, randomBytes, randomUUID } = require('node:crypto');
const { getPool } = require('../database/pools');
const env = require('../config/env');

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function createSession(userId, pool = getPool()) {
  if (typeof userId !== 'string' || !userId) throw new TypeError('A user id is required.');
  const token = randomBytes(32).toString('base64url');
  const ttlSeconds = env.sessionTtlDays * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  await pool.execute(
    'INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)',
    [randomUUID(), userId, hashToken(token), expiresAt],
  );
  return { token, expiresAt, maxAge: ttlSeconds };
}

async function revokeSession(token, pool = getPool()) {
  if (typeof token !== 'string' || token.length > 256) return false;
  const [result] = await pool.execute('DELETE FROM sessions WHERE token_hash = ?', [hashToken(token)]);
  return result.affectedRows > 0;
}

async function revokeUserSessions(userId, pool = getPool()) {
  const [result] = await pool.execute('DELETE FROM sessions WHERE user_id = ?', [userId]);
  return result.affectedRows;
}

module.exports = { hashToken, createSession, revokeSession, revokeUserSessions };