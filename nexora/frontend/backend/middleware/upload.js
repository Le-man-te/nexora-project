const path = require('node:path');
const multer = require('multer');
const ApiError = require('../utils/ApiErroir');
const { ALLOWED_EXTENSIONS } = require('../security/safeFilename');

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 20 * 1024 * 1024;
const MIME_TYPES = {
  '.pdf': ['application/pdf'],
  '.png': ['image/png'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.gif': ['image/gif'],
  '.webp': ['image/webp'],
  '.txt': ['text/plain'],
  '.md': ['text/markdown', 'text/plain'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  '.csv': ['text/csv', 'application/vnd.ms-excel', 'text/plain'],
  '.ppt': ['application/vnd.ms-powerpoint'],
  '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
};

const multipartParser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 5, fields: 10, parts: 15 },
  fileFilter(_req, file, callback) {
    const extension = path.extname(file.originalname || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      callback(ApiError.badRequest('This file type is not allowed.'));
      return;
    }
    if (!MIME_TYPES[extension]?.includes(file.mimetype)) {
      callback(ApiError.badRequest('File content type does not match its extension.'));
      return;
    }
    callback(null, true);
  },
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'files', maxCount: 5 },
]);

function validateUpload() {
  return function parseAndValidateUpload(req, res, next) {
    multipartParser(req, res, (error) => {
      if (error) {
        if (error instanceof multer.MulterError) {
          const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
          next(new ApiError(status, 'Upload limits were exceeded.', error.code));
          return;
        }
        next(error);
        return;
      }

      const files = [...(req.files?.file || []), ...(req.files?.files || [])];
      if (files.length === 0) {
        next(ApiError.badRequest('An uploaded file is required.'));
        return;
      }
      const totalBytes = files.reduce((total, file) => total + file.size, 0);
      if (totalBytes > MAX_TOTAL_BYTES) {
        next(new ApiError(413, 'Combined file size exceeds the 20 MB limit.', 'UPLOAD_TOO_LARGE'));
        return;
      }
      req.uploadFiles = files;
      next();
    });
  };
}

module.exports = validateUpload;
module.exports.validateUpload = validateUpload;
module.exports.MAX_FILE_BYTES = MAX_FILE_BYTES;
module.exports.MAX_TOTAL_BYTES = MAX_TOTAL_BYTES;
