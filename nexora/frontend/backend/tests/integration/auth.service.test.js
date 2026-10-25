const assert = require('node:assert/strict');
const test = require('node:test');
const { hashPassword, verifyPassword } = require('../../security/password');
const { validateEmail, validateResetPassword } = require('../../modules/auth/auth.validation');

test('password hashes are salted and verification uses the stored hash format', async () => {
  const first = await hashPassword('correct horse battery');
  const second = await hashPassword('correct horse battery');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('correct horse battery', first), true);
  assert.equal(await verifyPassword('wrong password', first), false);
  assert.equal(await verifyPassword('correct horse battery', 'invalid'), false);
});

test('password reset inputs are validated before database access', () => {
  assert.equal(validateEmail({ email: 'valid@example.com' }).isValid, true);
  assert.equal(validateEmail({ email: 'not-an-email' }).isValid, false);
  assert.equal(validateResetPassword({ token: 'bad', password: 'short' }).isValid, false);
  assert.equal(validateResetPassword({
    token: 'A'.repeat(43),
    password: 'long-enough-password',
  }).isValid, true);
});