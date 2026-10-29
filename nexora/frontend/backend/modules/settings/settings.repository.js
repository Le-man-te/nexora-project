const { getMongoDatabase } = require('../../database/mongo');

async function getProfile(userId, database = getMongoDatabase()) {
  return database.collection('users').findOne(
    { id: userId },
    { projection: { _id: 0, id: 1, name: 1, email: 1, avatar_url: 1, created_at: 1 } },
  );
}

async function updateProfile(userId, values, database = getMongoDatabase()) {
  const updates = {};
  if (Object.hasOwn(values, 'name')) updates.name = values.name;
  if (Object.hasOwn(values, 'avatarUrl')) updates.avatar_url = values.avatarUrl;
  if (Object.keys(updates).length) {
    updates.updated_at = new Date();
    await database.collection('users').updateOne({ id: userId }, { $set: updates });
  }
  return getProfile(userId, database);
}

async function getPreferences(userId, database = getMongoDatabase()) {
  const preferences = await database.collection('notification_preferences').findOne({ user_id: userId });
  if (!preferences) return {};
  const raw = preferences.preferences;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function updatePreferences(userId, patch, database = getMongoDatabase()) {
  const collection = database.collection('notification_preferences');
  const current = await collection.findOne({ user_id: userId });
  const raw = current?.preferences;
  const existing = typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
  const updated = { ...existing, ...patch };
  await collection.updateOne(
    { user_id: userId },
    {
      $set: { preferences: updated, updated_at: new Date() },
      $setOnInsert: { created_at: new Date() },
    },
    { upsert: true },
  );
  return updated;
}

async function listSessions(userId, database = getMongoDatabase()) {
  return database.collection('sessions')
    .find({ user_id: userId, expires_at: { $gt: new Date() } })
    .project({ _id: 0, id: 1, created_at: 1, expires_at: 1 })
    .sort({ created_at: -1 })
    .toArray();
}

async function revokeSession(userId, sessionId, database = getMongoDatabase()) {
  const result = await database.collection('sessions').deleteOne({ id: sessionId, user_id: userId });
  return result.deletedCount > 0;
}

async function changePassword(userId, currentSessionId, passwordHash, database = getMongoDatabase()) {
  const userUpdate = await database.collection('users').updateOne(
    { id: userId },
    { $set: { password_hash: passwordHash, updated_at: new Date() } },
  );
  if (userUpdate.matchedCount !== 1) throw new Error('Unable to update password for the authenticated account.');
  const result = await database.collection('sessions').deleteMany({
    user_id: userId,
    id: { $ne: currentSessionId },
  });
  return result.deletedCount;
}

async function getPasswordHash(userId, database = getMongoDatabase()) {
  const user = await database.collection('users').findOne(
    { id: userId },
    { projection: { _id: 0, password_hash: 1 } },
  );
  return user?.password_hash || null;
}

module.exports = {
  getProfile, updateProfile, getPreferences, updatePreferences,
  listSessions, revokeSession, changePassword, getPasswordHash,
};