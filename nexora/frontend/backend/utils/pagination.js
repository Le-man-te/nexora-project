const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

function parsePagination(query = {}) {
  const page = parseInteger(query.page, 1, 'page', 1, Number.MAX_SAFE_INTEGER);
  const limit = parseInteger(query.limit, DEFAULT_LIMIT, 'limit', 1, MAX_LIMIT);
  const offset = (page - 1) * limit;
  if (!Number.isSafeInteger(offset)) throw new TypeError('Requested page is too large.');
  return { page, limit, offset };
}

function parseInteger(value, fallback, name, minimum, maximum) {
  if (value === undefined || value === '') return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
    throw new TypeError(`${name} must be an integer between ${minimum} and ${maximum}.`);
  }
  return number;
}

function paginatedResult(items, total, pagination) {
  return {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}

module.exports = { DEFAULT_LIMIT, MAX_LIMIT, parsePagination, paginatedResult };