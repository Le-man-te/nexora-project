module.exports = {
  collection: 'notification_preferences',
  idField: 'user_id',
  indexes: [[{ user_id: 1 }, { unique: true }]],
};
