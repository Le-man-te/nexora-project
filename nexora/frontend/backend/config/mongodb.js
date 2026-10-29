require('./env');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const databaseName = process.env.MONGODB_DB_NAME || 'nexora';
const serverSelectionTimeoutMS = Number(process.env.MONGODB_CONNECT_TIMEOUT || 10000);

if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be configured in production.');
}
if (!/^[a-zA-Z0-9_-]+$/.test(databaseName)) {
  throw new Error('MONGODB_DB_NAME may contain only letters, numbers, underscores, and hyphens.');
}
if (!/^mongodb(?:\+srv)?:\/\//i.test(uri)) {
  throw new Error('MONGODB_URI must be a valid MongoDB connection URI.');
}
if (!Number.isInteger(serverSelectionTimeoutMS) || serverSelectionTimeoutMS < 1) {
  throw new Error('MONGODB_CONNECT_TIMEOUT must be a positive integer.');
}

module.exports = Object.freeze({
  uri,
  databaseName,
  serverSelectionTimeoutMS,
});
