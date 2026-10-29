const { createHash, randomBytes, randomUUID } = require('node:crypto');
const { getMongoDatabase } = require('../database/mongo');
const env = require('../config/env');

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function createSession(userId, database = getMongoDatabase()) {
  if (typeof userId !== 'string' || !userId) throw new TypeError('A user id is required.');
  const token = randomBytes(32).toString('base64url');
  const ttlSeconds = env.sessionTtlDays * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  await database.collection('sessions').insertOne({
    id: randomUUID(),
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
    created_at: new Date(),
  });
  return { token, expiresAt, maxAge: ttlSeconds };
}

async function revokeSession(token, database = getMongoDatabase()) {
  if (typeof token !== 'string' || token.length > 256) return false;
  const result = await database.collection('sessions').deleteOne({ token_hash: hashToken(token) });
  return result.deletedCount > 0;
}

async function revokeUserSessions(userId, database = getMongoDatabase()) {
  const result = await database.collection('sessions').deleteMany({ user_id: userId });
  return result.deletedCount;
}

module.exports = { hashToken, createSession, revokeSession, revokeUserSessions };