const { getMongoDatabase } = require('../../database/mongo');
const ApiError = require('../../utils/ApiErroir');

async function assertWorkspaceMember(userId, workspaceId, database = getMongoDatabase()) {
  const membership = await database.collection('workspace_members').findOne({
    workspace_id: workspaceId,
    user_id: userId,
  });
  if (!membership) throw ApiError.notFound('Workspace not found.');
}

async function overview(workspaceId, database = getMongoDatabase()) {
  const projectIds = await database.collection('projects').distinct('id', {
    workspace_id: workspaceId,
    archived_at: null,
  });
  const [projects, tasks, completed, members] = await Promise.all([
    database.collection('projects').countDocuments({ workspace_id: workspaceId, archived_at: null }),
    database.collection('tasks').countDocuments({ project_id: { $in: projectIds } }),
    database.collection('tasks').countDocuments({ project_id: { $in: projectIds }, status: 'done' }),
    database.collection('workspace_members').countDocuments({ workspace_id: workspaceId }),
  ]);
  return {
    projects,
    tasks: { total: tasks, completed, open: tasks - completed },
    members,
  };
}

async function trends(workspaceId, days, database = getMongoDatabase()) {
  const projectIds = await database.collection('projects').distinct('id', { workspace_id: workspaceId });
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const tasks = await database.collection('tasks').find({
    project_id: { $in: projectIds },
    created_at: { $gte: cutoff },
  }).project({ created_at: 1, status: 1 }).toArray();
  const byDay = new Map();
  for (const task of tasks) {
    const date = new Date(task.created_at).toISOString().slice(0, 10);
    const aggregate = byDay.get(date) || { date, created: 0, completed: 0 };
    aggregate.created += 1;
    if (task.status === 'done') aggregate.completed += 1;
    byDay.set(date, aggregate);
  }
  return [...byDay.values()].sort((left, right) => left.date.localeCompare(right.date));
}

async function projects(workspaceId, database = getMongoDatabase()) {
  const rows = await database.collection('projects').find({
    workspace_id: workspaceId,
    archived_at: null,
  }).sort({ updated_at: -1 }).toArray();
  const projectIds = rows.map(({ id }) => id);
  const tasks = await database.collection('tasks').find({ project_id: { $in: projectIds } })
    .project({ project_id: 1, status: 1 }).toArray();
  const counts = new Map();
  for (const task of tasks) {
    const aggregate = counts.get(task.project_id) || { task_count: 0, completed_tasks: 0 };
    aggregate.task_count += 1;
    if (task.status === 'done') aggregate.completed_tasks += 1;
    counts.set(task.project_id, aggregate);
  }
  return rows.map(({ id, name, status, priority }) => ({
    id,
    name,
    status,
    priority,
    task_count: counts.get(id)?.task_count || 0,
    completed_tasks: counts.get(id)?.completed_tasks || 0,
  }));
}

async function team(workspaceId, database = getMongoDatabase()) {
  const memberships = await database.collection('workspace_members').find({ workspace_id: workspaceId }).toArray();
  const userIds = memberships.map(({ user_id }) => user_id);
  const projectIds = await database.collection('projects').distinct('id', { workspace_id: workspaceId });
  const [users, tasks] = await Promise.all([
    database.collection('users').find({ id: { $in: userIds } }).project({ id: 1, name: 1 }).toArray(),
    database.collection('tasks').find({
      project_id: { $in: projectIds },
      assigned_to: { $in: userIds },
    }).project({ assigned_to: 1, status: 1 }).toArray(),
  ]);
  const userNames = new Map(users.map(({ id, name }) => [id, name]));
  const assignments = new Map();
  for (const task of tasks) {
    const aggregate = assignments.get(task.assigned_to) || { assigned_tasks: 0, completed_tasks: 0 };
    aggregate.assigned_tasks += 1;
    if (task.status === 'done') aggregate.completed_tasks += 1;
    assignments.set(task.assigned_to, aggregate);
  }
  return memberships
    .filter(({ user_id }) => userNames.has(user_id))
    .map(({ user_id, role }) => ({
      id: user_id,
      name: userNames.get(user_id),
      role,
      assigned_tasks: assignments.get(user_id)?.assigned_tasks || 0,
      completed_tasks: assignments.get(user_id)?.completed_tasks || 0,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

module.exports = { assertWorkspaceMember, overview, trends, projects, team };