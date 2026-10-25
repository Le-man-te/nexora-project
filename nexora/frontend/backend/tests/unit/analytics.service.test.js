const assert = require('node:assert/strict');
const test = require('node:test');
const { parsePagination } = require('../../utils/pagination');

test('analytics pagination has bounded defaults and rejects invalid limits', () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 25, offset: 0 });
  assert.deepEqual(parsePagination({ page: '3', limit: '10' }), { page: 3, limit: 10, offset: 20 });
  assert.throws(() => parsePagination({ limit: '1000' }), /integer between/);
});