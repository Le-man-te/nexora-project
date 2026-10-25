const { createHash } = require('node:crypto');
const { getPool } = require('../database/pools');
const env = require('../config/env');
const ApiError = require('../utils/ApiErroir');

function readCookie(req, cookieName) {
  const header = req.headers.cookie || '';
  for (const pair of header.split(';')) {
    const separator = pair.indexOf('=');
    if (separator >= 0 && pair.slice(0, separator).trim() === cookieName) {
      return pair.slice(separator + 1).trim();
    }
  }
  return null;
}

async function requireAuth(req, _res, next) {
  try {
    const token = readCookie(req, env.sessionCookieName);
    if (!token || token.length > 256) throw ApiError.unauthorized();
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const [rows] = await getPool().execute(
      `SELECT u.id, u.name, u.email, u.avatar_url, s.id AS session_id
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()
       LIMIT 1`,
      [tokenHash],
    );
    if (rows.length === 0) throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    req.user = rows[0];
    req.sessionTokenHash = tokenHash;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.readCookie = readCookie;