module.exports = {
  collection: 'stored_files',
  indexes: [
    [{ storage_key: 1 }, { unique: true }],
    [{ uploaded_by: 1, created_at: -1 }],
  ],
};
