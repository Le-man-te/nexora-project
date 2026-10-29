module.exports = {
  collection: 'users',
  indexes: [[{ email: 1 }, { unique: true }]],
};
