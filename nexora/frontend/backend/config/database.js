require('./env');

const database = Object.freeze({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nexora',
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: Number(process.env.DB_QUEUE_LIMIT || 0),
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 10000),
  timezone: 'Z',
  charset: 'utf8mb4',
});

if (process.env.NODE_ENV === 'production' && !database.password) {
  throw new Error('DB_PASSWORD must be configured in production.');
}
if (!Number.isInteger(database.port) || database.port < 1 || database.port > 65535) {
  throw new Error('DB_PORT must be an integer between 1 and 65535.');
}
if (!Number.isInteger(database.connectionLimit) || database.connectionLimit < 1) {
  throw new Error('DB_CONNECTION_LIMIT must be a positive integer.');
}
if (!Number.isInteger(database.queueLimit) || database.queueLimit < 0) {
  throw new Error('DB_QUEUE_LIMIT must be a non-negative integer.');
}
if (!Number.isInteger(database.connectTimeout) || database.connectTimeout < 1) {
  throw new Error('DB_CONNECT_TIMEOUT must be a positive integer.');
}
if (!database.database || !/^[a-zA-Z0-9_$-]+$/.test(database.database)) {
  throw new Error('DB_NAME must contain only letters, numbers, underscores, dollar signs, or hyphens.');
}

module.exports = database;