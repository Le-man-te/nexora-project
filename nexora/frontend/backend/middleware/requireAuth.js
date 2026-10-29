const { createHash } = require('node:crypto');
const { getMongoDatabase } = require('../database/mongo');
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
    const database = getMongoDatabase();
    const session = await database.collection('sessions').findOne({
      token_hash: tokenHash,
      expires_at: { $gt: new Date() },
    });
    const user = session && await database.collection('users').findOne(
      { id: session.user_id },
      { projection: { id: 1, name: 1, email: 1, avatar_url: 1, global_role: 1, disabled_at: 1 } },
    );
    if (!session || !user) throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    if (user.disabled_at) throw ApiError.unauthorized('This account has been disabled.');
    req.user = { ...user, global_role: user.global_role || 'user', session_id: session.id };
    req.sessionTokenHash = tokenHash;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAuth;
module.exports.requireAuth = requireAuth;
module.exports.readCookie = readCookie;