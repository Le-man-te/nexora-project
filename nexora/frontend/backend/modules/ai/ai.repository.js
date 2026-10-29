const { randomUUID } = require('node:crypto');
const { getMongoDatabase } = require('../../database/mongo');

async function listConversations(userId, database = getMongoDatabase()) {
  return database.collection('ai_conversations')
    .find({ user_id: userId })
    .project({ _id: 0, id: 1, workspace_id: 1, title: 1, created_at: 1, updated_at: 1 })
    .sort({ updated_at: -1 })
    .limit(100)
    .toArray();
}

async function getConversation(userId, id, database = getMongoDatabase()) {
  return database.collection('ai_conversations').findOne(
    { id, user_id: userId },
    { projection: { _id: 0, id: 1, workspace_id: 1, title: 1, created_at: 1, updated_at: 1 } },
  );
}

async function createConversation(userId, id, workspaceId, title, database = getMongoDatabase()) {
  const now = new Date();
  await database.collection('ai_conversations').insertOne({
    id,
    user_id: userId,
    workspace_id: workspaceId || null,
    title: title.slice(0, 200),
    created_at: now,
    updated_at: now,
  });
}

async function addExchange(userId, conversationId, userText, assistantText, database = getMongoDatabase()) {
  const conversation = await database.collection('ai_conversations').findOne({ id: conversationId, user_id: userId });
  if (!conversation) return false;
  const now = new Date();
  await database.collection('ai_messages').insertMany([
    {
      id: randomUUID(),
      conversation_id: conversationId,
      role: 'user',
      content: userText,
      provider: null,
      created_at: now,
    },
    {
      id: randomUUID(),
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantText,
      provider: process.env.AI_PROVIDER || 'openai-compatible',
      created_at: now,
    },
  ]);
  await database.collection('ai_conversations').updateOne(
    { id: conversationId, user_id: userId },
    { $set: { updated_at: now } },
  );
  return true;
}

async function getMessages(userId, conversationId, database = getMongoDatabase()) {
  const conversation = await getConversation(userId, conversationId, database);
  if (!conversation) return [];
  return database.collection('ai_messages')
    .find({ conversation_id: conversationId })
    .project({ _id: 0, id: 1, role: 1, content: 1, created_at: 1 })
    .sort({ created_at: 1 })
    .toArray();
}

async function deleteConversation(userId, id, database = getMongoDatabase()) {
  const result = await database.collection('ai_conversations').deleteOne({ id, user_id: userId });
  if (result.deletedCount) await database.collection('ai_messages').deleteMany({ conversation_id: id });
  return result.deletedCount > 0;
}

module.exports = { listConversations, getConversation, createConversation, addExchange, getMessages, deleteConversation };