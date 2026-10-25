const assert = require('node:assert/strict');
const test = require('node:test');
const app = require('../../app');

test('project collection rejects anonymous reads and writes', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const base = `http://127.0.0.1:${server.address().port}/api/projects`;
  const [read, write] = await Promise.all([
    fetch(base),
    fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Private' }) }),
  ]);
  assert.equal(read.status, 401);
  assert.equal(write.status, 401);
});