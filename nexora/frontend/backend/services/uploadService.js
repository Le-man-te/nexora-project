const { randomUUID } = require('node:crypto');
const { getMongoDatabase } = require('../database/mongo');
const storage = require('./storageService');
const ApiError = require('../utils/ApiErroir');
const logger = require('../config/logger');

async function saveUploads(userId, files, database = getMongoDatabase()) {
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

    const now = new Date();
    await database.collection('stored_files').insertMany(saved.map((file) => ({
      id: file.id,
      uploaded_by: userId,
      storage_key: file.storageKey,
      original_name: file.originalName,
      mime_type: file.mimeType,
      size_bytes: file.size,
      created_at: now,
    })));
  } catch (error) {
    try {
      await database.collection('stored_files').deleteMany({
        id: { $in: saved.map(({ id }) => id) },
      });
    } catch (cleanupError) {
      logger.error('Upload metadata cleanup failed.', { message: cleanupError.message });
    }
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

async function getUpload(userId, id, database = getMongoDatabase()) {
  const file = await database.collection('stored_files').findOne({
    id,
    uploaded_by: userId,
  });
  if (!file) throw ApiError.notFound('File not found.');
  const buffer = await storage.readFile(file.storage_key);
  return { buffer, originalName: file.original_name, size: Number(file.size_bytes) };
}

module.exports = { saveUploads, getUpload };
