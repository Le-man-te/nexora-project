function toMysqlDate(value, field = 'date') {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new TypeError(`${field} must use YYYY-MM-DD format.`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new TypeError(`${field} is not a valid calendar date.`);
  }
  return value;
}

function isExpired(value, now = new Date()) {
  const timestamp = value instanceof Date ? value.getTime() : Date.parse(value);
  if (!Number.isFinite(timestamp)) throw new TypeError('Expiry must be a valid date.');
  return timestamp <= now.getTime();
}

module.exports = { toMysqlDate, isExpired };