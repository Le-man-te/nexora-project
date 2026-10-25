const assert = require('node:assert/strict');
const test = require('node:test');
const app = require('../../app');

test('task routes require authentication before accessing project data', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/tasks`);
  assert.equal(response.status, 401);
  assert.match((await response.json()).message, /authentication/i);
});