const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function parsePort(value, name, fallback) {
  const port = Number(value || fallback);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`);
  }
  return port;
}

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parsePort(process.env.PORT, 'PORT', 5000),
  sessionCookieName: process.env.SESSION_COOKIE_NAME || 'nexora_session',
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS || 14),
  trustProxy: process.env.TRUST_PROXY === 'true',
});

if (!/^[a-zA-Z0-9_-]+$/.test(env.sessionCookieName)) {
  throw new Error('SESSION_COOKIE_NAME may contain only letters, numbers, underscores, and hyphens.');
}
if (!Number.isFinite(env.sessionTtlDays) || env.sessionTtlDays < 1 || env.sessionTtlDays > 365) {
  throw new Error('SESSION_TTL_DAYS must be a number between 1 and 365.');
}

module.exports = env;
