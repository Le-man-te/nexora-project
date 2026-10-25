const path = require('node:path');
const { randomUUID } = require('node:crypto');

const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.txt', '.md',
  '.doc', '.docx', '.xls', '.xlsx', '.csv', '.ppt', '.pptx',
]);

function safeFilename(input, { allowedExtensions = ALLOWED_EXTENSIONS } = {}) {
  if (typeof input !== 'string' || !input.trim() || input.length > 255) {
    throw new TypeError('A filename between 1 and 255 characters is required.');
  }
  const basename = path.basename(input.replace(/\\/g, '/')).normalize('NFKC');
  const extension = path.extname(basename).toLowerCase();
  if (!allowedExtensions.has(extension)) throw new TypeError('This file type is not allowed.');
  const stem = path.basename(basename, extension)
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'file';
  return `${randomUUID()}-${stem}${extension}`;
}

module.exports = { ALLOWED_EXTENSIONS, safeFilename };