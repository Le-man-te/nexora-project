const assert = require('node:assert/strict');
const test = require('node:test');
const { toMysqlDate, isExpired } = require('../../utils/date');
const { validateCreateTask } = require('../../modules/tasks/tasks.validations');

test('task validation rejects invalid values and preserves accepted fields', () => {
  assert.equal(validateCreateTask({ projectId: 'project-id', title: 'A task' }).isValid, true);
  assert.equal(validateCreateTask({ projectId: 'project-id', title: '' }).isValid, false);
});

test('date helper validates calendar dates and expiry boundaries', () => {
  assert.equal(toMysqlDate('2026-10-24'), '2026-10-24');
  assert.throws(() => toMysqlDate('2026-02-30'), /valid calendar date/);
  assert.equal(isExpired('2020-01-01T00:00:00.000Z'), true);
});