module.exports = {
  collection: 'project_members',
  indexes: [[{ project_id: 1, user_id: 1 }, { unique: true }]],
};
