module.exports = {
  collection: 'tasks',
  indexes: [
    [{ project_id: 1, position: 1, created_at: -1 }],
    [{ assigned_to: 1 }],
  ],
};
