const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const app = require('../app');
const { runMigrations } = require('../database/migrate');
const { getMigrationFiles } = require('../database/migrations/run');
const { TABLES, migrateMySqlToMongo } = require('../database/migrate-mysql-to-mongodb');
const { safeFilename } = require('../security/safeFilename');
const { createResourceRepository, createResourceService } = require('../utils/resourceModule');

test('ordered MongoDB migration files cover every application collection', async () => {
  const files = await getMigrationFiles();
  assert.equal(files.length, TABLES.length);
  assert.deepEqual(files, [...files].sort((left, right) => left.localeCompare(right, 'en')));

  const collections = [];
  for (const file of files) {
    const migration = require(path.join(__dirname, '..', 'database', 'migrations', file));
    assert.ok(Array.isArray(migration.indexes), `${file} should define MongoDB indexes`);
    collections.push(migration.collection);
  }
  assert.deepEqual(collections, TABLES);
});

test('MongoDB migrations create collection indexes once and record their completion', async () => {
  const indexedCollections = [];
  const appliedMigrations = new Set();
  const database = {
    databaseName: 'nexora',
    collection(name) {
      if (name === '_migrations') {
        return {
          async findOne(filter) {
            return appliedMigrations.has(filter._id) ? { _id: filter._id } : null;
          },
          async insertOne(migration) {
            appliedMigrations.add(migration._id);
          },
        };
      }
      return {
        async createIndexes(indexes) {
          indexedCollections.push({ name, indexes });
        },
      };
    },
  };

  const firstRun = await runMigrations(database);
  const secondRun = await runMigrations(database);
  assert.deepEqual(firstRun, { applied: TABLES.length, total: TABLES.length, database: 'nexora' });
  assert.deepEqual(secondRun, { applied: 0, total: TABLES.length, database: 'nexora' });
  assert.equal(indexedCollections.length, TABLES.length);
  assert.ok(indexedCollections.every(({ indexes }) => indexes.length > 0));
});

test('MySQL transfer preserves row fields and can upsert into MongoDB', async () => {
  let userRow = { id: 'user-1', email: 'first@example.com' };
  const documents = new Map();
  const sourceConnection = {
    async query(sql) {
      const table = sql.match(/FROM `([^`]+)`/)[1];
      if (sql.includes('COUNT(*)')) return [[{ total: table === 'users' ? 1 : 0 }]];
      return [table === 'users' ? [userRow] : []];
    },
  };
  const targetDatabase = {
    collection() {
      return {
        async bulkWrite(operations) {
          for (const { updateOne } of operations) {
            if (!documents.has(updateOne.filter._id)) {
              documents.set(updateOne.filter._id, updateOne.update.$setOnInsert);
            }
          }
        },
      };
    },
  };

  assert.deepEqual(await migrateMySqlToMongo(sourceConnection, targetDatabase), {
    tables: TABLES.length,
    records: 1,
  });
  assert.deepEqual(documents.get('user-1'), { id: 'user-1', email: 'first@example.com', _id: 'user-1' });
  userRow = { id: 'user-1', email: 'updated@example.com' };
  await migrateMySqlToMongo(sourceConnection, targetDatabase);
  assert.equal(documents.get('user-1').email, 'first@example.com');
});

test('resource repositories only accept trusted table and field identifiers', () => {
  assert.throws(() => createResourceRepository({
    table: 'users; DROP TABLE users',
    fields: {},
    scopeSql: 'r.id = ?',
    createFields: [],
    updateFields: [],
    requiredFields: [],
  }), /Unsafe MongoDB collection name/);
  assert.throws(() => safeFilename('../../payload.svg'), /not allowed/);
  assert.match(safeFilename('../../report.pdf'), /^[0-9a-f-]{36}-report\.pdf$/i);
});

test('resource services retain route metadata for response envelopes', () => {
  const service = createResourceService({}, { singular: 'note', plural: 'notes' });
  assert.equal(service.singular, 'note');
  assert.equal(service.plural, 'notes');
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
