module.exports = {
  collection: 'password_reset_tokens',
  indexes: [
    [{ token_hash: 1 }, { unique: true }],
    [{ user_id: 1 }],
    [{ expires_at: 1 }, { expireAfterSeconds: 0 }],
  ],
};
