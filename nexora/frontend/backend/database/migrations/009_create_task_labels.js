module.exports = {
  collection: 'task_labels',
  indexes: [[{ task_id: 1, name: 1 }, { unique: true }]],
};
