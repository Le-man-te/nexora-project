module.exports = {
  collection: 'activity_logs',
  indexes: [[{ workspace_id: 1, created_at: -1 }]],
};
