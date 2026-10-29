const { randomUUID } = require('node:crypto');
const { getMongoDatabase } = require('../../database/mongo');

async function findUserByEmail(email, database = getMongoDatabase()) {
  return database.collection('users').findOne(
    { email },
    { projection: { id: 1, name: 1, email: 1 } },
  );
}

async function createResetToken(userId, tokenHash, expiresAt, database = getMongoDatabase()) {
  await database.collection('password_reset_tokens').deleteMany({ user_id: userId, used_at: null });
  await database.collection('password_reset_tokens').insertOne({
    id: randomUUID(),
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiresAt,
    used_at: null,
    created_at: new Date(),
  });
}

async function resetPassword(tokenHash, passwordHash, database = getMongoDatabase()) {
  const resetToken = await database.collection('password_reset_tokens').findOneAndUpdate(
    { token_hash: tokenHash, used_at: null, expires_at: { $gt: new Date() } },
    { $set: { used_at: new Date() } },
    { returnDocument: 'before' },
  );
  if (!resetToken) return false;
  const userUpdate = await database.collection('users').updateOne(
    { id: resetToken.user_id },
    { $set: { password_hash: passwordHash, updated_at: new Date() } },
  );
  if (userUpdate.matchedCount !== 1) throw new Error('Password reset user no longer exists.');
  await database.collection('sessions').deleteMany({ user_id: resetToken.user_id });
  return true;
}

module.exports = { findUserByEmail, createResetToken, resetPassword };