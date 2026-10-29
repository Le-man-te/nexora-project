const assert = require('node:assert/strict');
const test = require('node:test');
const service = require('../../modules/admin/admin.service');

function collectionStub(overrides = {}) {
  return {
    find: overrides.find || (() => ({
      sort() { return this; },
      limit() { return this; },
      toArray: async () => [],
    })),
    countDocuments: overrides.countDocuments || (async () => 0),
    findOne: overrides.findOne || (async () => null),
    updateOne: overrides.updateOne || (async () => ({ matchedCount: 1 })),
    deleteMany: overrides.deleteMany || (async () => ({ deletedCount: 0 })),
  };
}

test('platform overview returns counts and bounded user and workspace lists', async () => {
  const calls = [];
  const database = {
    collection(name) {
      return collectionStub({
        find: (filter, options) => {
          calls.push({ type: 'find', name, filter, options });
          return {
            sort(sort) { calls.push({ type: 'sort', name, sort }); return this; },
            limit(limit) { calls.push({ type: 'limit', name, limit }); return this; },
            toArray: async () => [],
          };
        },
        countDocuments: async () => 2,
      });
    },
  };

  const overview = await service.getPlatformOverview(database);
  assert.deepEqual(overview.counts, { users: 2, workspaces: 2, projects: 2, tasks: 2 });
  assert.deepEqual(overview.users, []);
  assert.deepEqual(overview.workspaces, []);
  assert.deepEqual(calls.filter(({ type }) => type === 'limit').map(({ limit }) => limit), [100, 100]);
});

test('disabling a user revokes sessions and records disabled time', async () => {
  const updated = [];
  const deleted = [];
  const database = {
    collection(name) {
      return collectionStub({
        findOne: async () => ({ id: 'target-user', global_role: 'user' }),
        updateOne: async (...args) => { updated.push([name, ...args]); return { matchedCount: 1 }; },
        deleteMany: async (...args) => { deleted.push([name, ...args]); return { deletedCount: 1 }; },
      });
    },
  };

  const result = await service.setUserDisabled('admin-id', '12345678-1234-1234-1234-123456789012', true, database);
  assert.deepEqual(result, { id: '12345678-1234-1234-1234-123456789012', disabled: true });
  assert.ok(updated[0][2].$set.disabled_at instanceof Date);
  assert.deepEqual(deleted, [['sessions', { user_id: '12345678-1234-1234-1234-123456789012' }]]);
});

test('platform administrators cannot disable themselves or another platform administrator', async () => {
  await assert.rejects(
    service.setUserDisabled('same-id', 'same-id', true, {}),
    (error) => error.status === 400,
  );
  const database = {
    collection: () => collectionStub({ findOne: async () => ({ global_role: 'platform_admin' }) }),
  };
  await assert.rejects(
    service.setUserDisabled('admin-id', '12345678-1234-1234-1234-123456789012', true, database),
    (error) => error.status === 400,
  );
});

test('workspace archive status can be restored', async () => {
  let update;
  const database = {
    collection: () => collectionStub({
      findOne: async () => ({ id: 'workspace-id' }),
      updateOne: async (...args) => { update = args; return { matchedCount: 1 }; },
    }),
  };

  const result = await service.setWorkspaceArchived(
    '12345678-1234-1234-1234-123456789012',
    false,
    database,
  );
  assert.deepEqual(result, { id: '12345678-1234-1234-1234-123456789012', archived: false });
  assert.equal(update[1].$set.archived_at, null);
});
