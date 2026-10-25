const { randomUUID } = require('node:crypto');
const { getPool } = require('../database/pools');
const { withTransaction } = require('../database/transaction');
const storage = require('./storageService');
const ApiError = require('../utils/ApiErroir');
const logger = require('../config/logger');

async function saveUploads(userId, files, pool = getPool()) {
  if (!Array.isArray(files) || files.length < 1 || files.length > 5) {
    throw ApiError.badRequest('Upload one to five files at a time.');
  }

  const saved = [];
  try {
    for (const file of files) {
      const stored = await storage.storeFile(file.buffer, file.originalname);
      saved.push({
        id: randomUUID(),
        storageKey: stored.key,
        originalName: file.originalname.slice(0, 255),
        mimeType: file.mimetype,
        size: stored.size,
      });
    }

    await withTransaction(pool, async (connection) => {
      for (const file of saved) {
        await connection.execute(
          `INSERT INTO stored_files
             (id, uploaded_by, storage_key, original_name, mime_type, size_bytes)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [file.id, userId, file.storageKey, file.originalName, file.mimeType, file.size],
        );
      }
    });
  } catch (error) {
    for (const file of saved) {
      try {
        await storage.deleteFile(file.storageKey);
      } catch (cleanupError) {
        logger.error('Upload cleanup failed.', { message: cleanupError.message });
      }
    }
    throw error;
  }

  return saved.map(({ id, originalName, mimeType, size }) => ({
    id,
    filename: originalName,
    mimeType,
    size,
    url: `/api/uploads/${encodeURIComponent(id)}`,
  }));
}

async function getUpload(userId, id, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT storage_key, original_name, mime_type, size_bytes
     FROM stored_files WHERE id = ? AND uploaded_by = ? LIMIT 1`,
    [id, userId],
  );
  if (!rows.length) throw ApiError.notFound('File not found.');
  const file = rows[0];
  const buffer = await storage.readFile(file.storage_key);
  return { buffer, originalName: file.original_name, size: Number(file.size_bytes) };
}

module.exports = { saveUploads, getUpload };
