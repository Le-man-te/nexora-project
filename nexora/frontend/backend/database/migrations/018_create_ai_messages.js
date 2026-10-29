module.exports = {
  collection: 'ai_messages',
  indexes: [[{ conversation_id: 1, created_at: 1 }]],
};
