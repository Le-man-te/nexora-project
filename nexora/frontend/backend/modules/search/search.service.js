const repository = require('./search.repository');
const ApiError = require('../../utils/ApiErroir');

const TYPES = new Set(['project', 'workspace', 'task']);

async function search(userId, query) {
  const value = typeof query.q === 'string' ? query.q.trim() : '';
  const type = typeof query.type === 'string' ? query.type.toLowerCase() : '';
  if (!value) throw ApiError.badRequest('Search query is required.');
  if (value.length > 120) throw ApiError.badRequest('Search query must be 120 characters or fewer.');
  if (type && !TYPES.has(type)) throw ApiError.badRequest('Search type is invalid.');
  const results = await repository.search(userId, value, type);
  return { results, total: results.length, query: value };
}

module.exports = { search };