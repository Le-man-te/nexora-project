module.exports = {
  collection: 'ai_conversations',
  indexes: [[{ user_id: 1, updated_at: -1 }]],
};
