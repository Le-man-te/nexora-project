const assert = require('node:assert/strict');
const test = require('node:test');
const { validatePassword } = require('../../security/password');

test('password policy rejects short and overlong passwords', () => {
  assert.equal(validatePassword('short').isValid, false);
  assert.equal(validatePassword('x'.repeat(129)).isValid, false);
  assert.equal(validatePassword('a sufficiently long password').isValid, true);
});