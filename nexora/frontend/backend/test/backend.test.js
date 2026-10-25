const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const test = require('node:test');
const app = require('../app');
const { getMigrationFiles, runMigrations } = require('../database/migrate');
const { safeFilename } = require('../security/safeFilename');
const { createResourceRepository } = require('../utils/resourceModule');

test('all numbered migrations are present, ordered, and non-empty', async () => {
  const files = await getMigrationFiles();
  assert.equal(files.length, 21);
  assert.deepEqual(files, [...files].sort((left, right) => left.localeCompare(right, 'en')));

  for (const file of files) {
    const contents = await fs.readFile(path.join(__dirname, '..', 'database', 'migrations', file), 'utf8');
    assert.match(contents, /^\s*CREATE TABLE /i, `${file} should define a table`);
  }
});

test('migration runner applies each migration once', async () => {
  const appliedNames = new Set();
  const executedSql = [];
  const pool = {
    async query(sql) {
      if (sql.includes('CREATE TABLE IF NOT EXISTS schema_migrations')) return [[], []];
      if (sql === 'SELECT name FROM schema_migrations') {
        return [[...appliedNames].map((name) => ({ name })), []];
      }
      executedSql.push(sql);
      return [[], []];
    },
    async execute(_sql, [name]) {
      appliedNames.add(name);
      return [[], []];
    },
  };

  const firstRun = await runMigrations(pool);
  const secondRun = await runMigrations(pool);
  assert.deepEqual(firstRun, { applied: 21, total: 21 });
  assert.deepEqual(secondRun, { applied: 0, total: 21 });
  assert.equal(executedSql.length, 21);
});

test('resource repositories only accept trusted table and field identifiers', () => {
  assert.throws(() => createResourceRepository({
    table: 'users; DROP TABLE users',
    fields: {},
    scopeSql: 'r.id = ?',
    createFields: [],
    updateFields: [],
    requiredFields: [],
  }), /Unsafe SQL identifier/);
  assert.throws(() => safeFilename('../../payload.svg'), /not allowed/);
  assert.match(safeFilename('../../report.pdf'), /^[0-9a-f-]{36}-report\.pdf$/i);
});

test('health endpoint works without a database connection', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json().then(({ ok, service }) => ({ ok, service })), {
    ok: true,
    service: 'nexora-backend',
  });
});

test('unknown API routes return a JSON 404', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });

  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/not-a-route`);
  assert.equal(response.status, 404);
  assert.equal((await response.json()).message, 'Route not found.');
});

test('state-changing requests with a session cookie reject untrusted origins', async (t) => {
  const server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/notes`, {
    method: 'POST',
    headers: {
      Cookie: 'nexora_session=opaque-session',
      Origin: 'https://evil.example',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: 'No cross-site mutation' }),
  });
  assert.equal(response.status, 403);
});
