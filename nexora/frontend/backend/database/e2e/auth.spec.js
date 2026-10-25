const assert = require('node:assert/strict');
const test = require('node:test');
const app = require('../../app');

test('auth routes do not disclose a user when an anonymous request is made', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/me`);
  assert.equal(response.status, 401);
  assert.match((await response.json()).message, /authentication/i);
});