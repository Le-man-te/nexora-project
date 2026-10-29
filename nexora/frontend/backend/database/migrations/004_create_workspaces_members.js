module.exports = {
  collection: 'workspace_members',
  indexes: [
    [{ workspace_id: 1, user_id: 1 }, { unique: true }],
    [{ user_id: 1, created_at: 1 }],
  ],
};
