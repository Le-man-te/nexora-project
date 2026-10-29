const { getMongoDatabase } = require('../../database/mongo');

async function search(userId, term, type, database = getMongoDatabase()) {
  const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const workspaceIds = await database.collection('workspace_members').distinct('workspace_id', { user_id: userId });
  const projectIds = await database.collection('projects').distinct('id', { workspace_id: { $in: workspaceIds } });
  const searches = [];
  if (!type || type === 'project') {
    const rows = await database.collection('projects').find({
      workspace_id: { $in: workspaceIds },
      archived_at: null,
      $or: [{ name: pattern }, { description: pattern }],
    }).project({ id: 1, name: 1, description: 1 }).limit(25).toArray();
    searches.push(...rows.map(({ id, name, description }) => ({ id, type: 'Project', title: name, description })));
  }
  if (!type || type === 'workspace') {
    const rows = await database.collection('workspaces').find({
      id: { $in: workspaceIds },
      archived_at: null,
      $or: [{ name: pattern }, { description: pattern }],
    }).project({ id: 1, name: 1, description: 1 }).limit(25).toArray();
    searches.push(...rows.map(({ id, name, description }) => ({ id, type: 'Workspace', title: name, description })));
  }
  if (!type || type === 'task') {
    const rows = await database.collection('tasks').find({
      project_id: { $in: projectIds },
      $or: [{ title: pattern }, { description: pattern }],
    }).project({ id: 1, title: 1, description: 1 }).limit(25).toArray();
    searches.push(...rows.map(({ id, title, description }) => ({ id, type: 'Task', title, description })));
  }
  return searches.map(({ id, type: resultType, title, description }) => ({
    id,
    type: resultType,
    title,
    description: description || '',
  }));
}

module.exports = { search };