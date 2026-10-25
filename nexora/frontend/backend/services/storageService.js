const fs = require('node:fs/promises');
const path = require('node:path');
const { safeFilename } = require('../security/safeFilename');

const ROOT_DIRECTORY = path.resolve(process.env.STORAGE_DIRECTORY || path.join(__dirname, '..', 'storage'));

function resolveStoredFile(key) {
  if (typeof key !== 'string' || !/^[0-9a-f-]{36}-[a-zA-Z0-9_-]{1,80}\.[a-z0-9]{2,5}$/i.test(key)) {
    throw new TypeError('Storage key is invalid.');
  }
  const resolved = path.resolve(ROOT_DIRECTORY, key);
  if (path.dirname(resolved) !== ROOT_DIRECTORY) throw new TypeError('Storage key is invalid.');
  return resolved;
}

async function storeFile(fileBuffer, originalName) {
  if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
    throw new TypeError('A non-empty file buffer is required.');
  }
  const key = safeFilename(originalName);
  const target = resolveStoredFile(key);
  await fs.mkdir(ROOT_DIRECTORY, { recursive: true, mode: 0o700 });
  await fs.writeFile(target, fileBuffer, { flag: 'wx', mode: 0o600 });
  return { key, size: fileBuffer.length };
}

async function readFile(key) {
  return fs.readFile(resolveStoredFile(key));
}

async function deleteFile(key) {
  try {
    await fs.unlink(resolveStoredFile(key));
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

module.exports = { storeFile, readFile, deleteFile };