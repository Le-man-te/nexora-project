module.exports = {
  collection: 'comments',
  indexes: [
    [{ task_id: 1, created_at: -1 }],
    [{ project_id: 1, created_at: -1 }],
    [{ document_id: 1, created_at: -1 }],
  ],
};
