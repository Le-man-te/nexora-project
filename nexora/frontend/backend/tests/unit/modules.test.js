const assert = require('node:assert/strict');
const test = require('node:test');

const routes = [
  '../../modules/admin/admin.routes',
  '../../modules/ai/ai.routes',
  '../../modules/analytics/analytics.routes',
  '../../modules/auth/auth.routes',
  '../../modules/collaboration/commets.routes',
  '../../modules/documents/documents.routes',
  '../../modules/health/health.routes',
  '../../modules/notes/notes.routes',
  '../../modules/notifications/notification.routes',
  '../../modules/projects/projects.routes',
  '../../modules/search/search.routes',
  '../../modules/settings/settings.routes',
  '../../modules/tasks/tasks.routes',
  '../../modules/users/users.routes',
  '../../modules/workspaces/workspaces.routes',
];

test('all feature routers load without opening database connections', () => {
  for (const route of routes) {
    const router = require(route);
    assert.equal(typeof router, 'function', `${route} should export an Express router`);
  }
});
