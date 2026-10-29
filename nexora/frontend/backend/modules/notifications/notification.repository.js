const { getMongoDatabase } = require('../../database/mongo');

async function list(userId, { limit = 25, offset = 0 } = {}, database = getMongoDatabase()) {
  const collection = database.collection('notifications');
  const [items, total] = await Promise.all([
    collection.find({ user_id: userId })
      .project({ _id: 0, id: 1, type: 1, title: 1, message: 1, data: 1, read_at: 1, created_at: 1 })
      .sort({ created_at: -1 })
      .skip(offset)
      .limit(limit)
      .toArray(),
    collection.countDocuments({ user_id: userId }),
  ]);
  return { items, total };
}

async function unreadCount(userId, database = getMongoDatabase()) {
  return database.collection('notifications').countDocuments({ user_id: userId, read_at: null });
}

async function markRead(userId, id, database = getMongoDatabase()) {
  const result = await database.collection('notifications').updateOne(
    { id, user_id: userId, read_at: null },
    { $set: { read_at: new Date() } },
  );
  if (result.matchedCount) return true;
  return database.collection('notifications').countDocuments({ id, user_id: userId }) > 0;
}

async function markAllRead(userId, database = getMongoDatabase()) {
  const result = await database.collection('notifications').updateMany(
    { user_id: userId, read_at: null },
    { $set: { read_at: new Date() } },
  );
  return result.modifiedCount;
}

async function remove(userId, id, database = getMongoDatabase()) {
  const result = await database.collection('notifications').deleteOne({ id, user_id: userId });
  return result.deletedCount > 0;
}

module.exports = { list, unreadCount, markRead, markAllRead, remove };