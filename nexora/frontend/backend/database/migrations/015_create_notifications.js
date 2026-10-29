module.exports = {
  collection: 'notifications',
  indexes: [
    [{ user_id: 1, created_at: -1 }],
    [{ user_id: 1, read_at: 1 }],
  ],
};
