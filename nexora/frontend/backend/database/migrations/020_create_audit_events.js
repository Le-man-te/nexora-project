module.exports = {
  collection: 'audit_events',
  indexes: [
    [{ actor_id: 1, created_at: -1 }],
    [{ event_type: 1, created_at: -1 }],
  ],
};
