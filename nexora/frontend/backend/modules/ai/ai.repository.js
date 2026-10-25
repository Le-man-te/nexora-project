const { randomUUID } = require('node:crypto');
const { getPool } = require('../../database/pools');
const { withTransaction } = require('../../database/transaction');

async function listConversations(userId, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT id, workspace_id, title, created_at, updated_at
     FROM ai_conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100`,
    [userId],
  );
  return rows;
}

async function getConversation(userId, id, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT id, workspace_id, title, created_at, updated_at
     FROM ai_conversations WHERE id = ? AND user_id = ? LIMIT 1`,
    [id, userId],
  );
  return rows[0] || null;
}

async function createConversation(userId, id, workspaceId, title, pool = getPool()) {
  await pool.execute(
    `INSERT INTO ai_conversations (id, user_id, workspace_id, title)
     VALUES (?, ?, ?, ?)`,
    [id, userId, workspaceId, title.slice(0, 200)],
  );
}

async function addExchange(userId, conversationId, userText, assistantText, pool = getPool()) {
  await withTransaction(pool, async (connection) => {
    await connection.execute(
      `INSERT INTO ai_messages (id, conversation_id, role, content, provider)
       SELECT ?, c.id, 'user', ?, NULL FROM ai_conversations c
       WHERE c.id = ? AND c.user_id = ?`,
      [randomUUID(), userText, conversationId, userId],
    );
    await connection.execute(
      `INSERT INTO ai_messages (id, conversation_id, role, content, provider)
       SELECT ?, c.id, 'assistant', ?, ? FROM ai_conversations c
       WHERE c.id = ? AND c.user_id = ?`,
      [randomUUID(), assistantText, process.env.AI_PROVIDER || 'openai-compatible', conversationId, userId],
    );
    await connection.execute(
      'UPDATE ai_conversations SET updated_at = UTC_TIMESTAMP() WHERE id = ? AND user_id = ?',
      [conversationId, userId],
    );
  });
}

async function getMessages(userId, conversationId, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT m.id, m.role, m.content, m.created_at
     FROM ai_messages m JOIN ai_conversations c ON c.id = m.conversation_id
     WHERE c.id = ? AND c.user_id = ? ORDER BY m.created_at`,
    [conversationId, userId],
  );
  return rows;
}

async function deleteConversation(userId, id, pool = getPool()) {
  const [result] = await pool.execute(
    'DELETE FROM ai_conversations WHERE id = ? AND user_id = ?',
    [id, userId],
  );
  return result.affectedRows > 0;
}

module.exports = { listConversations, getConversation, createConversation, addExchange, getMessages, deleteConversation };