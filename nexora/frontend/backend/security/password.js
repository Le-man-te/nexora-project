const { promisify } = require('node:util');
const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');

const scryptAsync = promisify(scrypt);
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
    return { isValid: false, message: `Password must be between ${PASSWORD_MIN_LENGTH} and ${PASSWORD_MAX_LENGTH} characters.` };
  }
  return { isValid: true };
}

async function hashPassword(password) {
  const validation = validatePassword(password);
  if (!validation.isValid) throw new TypeError(validation.message);
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scryptAsync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, encodedHash) {
  if (typeof password !== 'string' || typeof encodedHash !== 'string') return false;
  const [salt, hash] = encodedHash.split(':');
  if (!/^[a-f0-9]{32}$/i.test(salt || '') || !/^[a-f0-9]{128}$/i.test(hash || '')) return false;
  const actual = await scryptAsync(password, salt, 64);
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'));
}

module.exports = { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, validatePassword, hashPassword, verifyPassword };