module.exports = {
  collection: 'workspace_invitations',
  indexes: [
    [{ token_hash: 1 }, { unique: true }],
    [{ workspace_id: 1, created_at: -1 }],
    [{ email: 1, status: 1 }],
  ],
};
