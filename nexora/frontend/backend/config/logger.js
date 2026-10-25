require('./env');

const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const configuredLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
const threshold = levels[configuredLevel] ?? levels.info;

function write(level, message, metadata) {
  if (levels[level] > threshold) return;
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: typeof message === 'string' ? message : String(message),
  };
  if (metadata !== undefined) entry.metadata = metadata;
  const output = JSON.stringify(entry);
  (level === 'error' ? console.error : console.log)(output);
}

module.exports = Object.freeze({
  error: (message, metadata) => write('error', message, metadata),
  warn: (message, metadata) => write('warn', message, metadata),
  info: (message, metadata) => write('info', message, metadata),
  debug: (message, metadata) => write('debug', message, metadata),
});