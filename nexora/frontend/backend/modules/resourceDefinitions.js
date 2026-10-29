const { getMongoDatabase } = require('../database/mongo');
const ApiError = require('../utils/ApiErroir');

async function memberWorkspaceIds(userId, database = getMongoDatabase()) {
  return database.collection('workspace_members').distinct('workspace_id', { user_id: userId });
}

async function authorizeWorkspace(userId, workspaceId, database = getMongoDatabase(), minimumRole = 'member') {
  const membership = await database.collection('workspace_members').findOne({
    workspace_id: workspaceId,
    user_id: userId,
  });
  if (!membership) throw ApiError.notFound('Workspace not found.');
  if (minimumRole === 'admin' && !['owner', 'admin'].includes(membership.role)) {
    throw ApiError.forbidden('Workspace administrator permission is required.');
  }
}

const definitions = {
  notes: {
    singular: 'note', plural: 'notes', table: 'notes',
    scopeQuery: async (userId, database) => ({ workspace_id: { $in: await memberWorkspaceIds(userId, database) } }),
    fields: {
      workspaceId: { column: 'workspace_id', type: 'string', maxLength: 36, label: 'Workspace' },
      title: { column: 'title', type: 'string', maxLength: 200, label: 'Title' },
      content: { column: 'content', type: 'string', maxLength: 50000, nullable: true, label: 'Content' },
      isPinned: { column: 'is_pinned', type: 'boolean', label: 'Pinned state' },
    },
    createFields: ['workspaceId', 'title', 'content'],
    updateFields: ['title', 'content', 'isPinned'],
    requiredFields: ['workspaceId', 'title'],
    createdByColumn: 'author_id',
    authorizeCreate: (userId, values, database) => authorizeWorkspace(userId, values.workspaceId, database),
    orderBy: 'updated_at',
  },
  documents: {
    singular: 'document', plural: 'documents', table: 'documents',
    scopeQuery: async (userId, database) => ({ workspace_id: { $in: await memberWorkspaceIds(userId, database) } }),
    fields: {
      workspaceId: { column: 'workspace_id', type: 'string', maxLength: 36, label: 'Workspace' },
      title: { column: 'title', type: 'string', maxLength: 200, label: 'Title' },
      content: { column: 'content', type: 'string', maxLength: 50000, nullable: true, label: 'Content' },
    },
    createFields: ['workspaceId', 'title', 'content'],
    updateFields: ['title', 'content'],
    requiredFields: ['workspaceId', 'title'],
    createdByColumn: 'created_by',
    authorizeCreate: (userId, values, database) => authorizeWorkspace(userId, values.workspaceId, database),
    orderBy: 'updated_at',
  },
  projects: {
    singular: 'project', plural: 'projects', table: 'projects',
    scopeQuery: async (userId, database) => ({ workspace_id: { $in: await memberWorkspaceIds(userId, database) } }),
    fields: {
      workspaceId: { column: 'workspace_id', type: 'string', maxLength: 36, label: 'Workspace' },
      name: { column: 'name', type: 'string', maxLength: 160, label: 'Project name' },
      description: { column: 'description', type: 'string', maxLength: 50000, nullable: true },
      status: { column: 'status', type: 'enum', values: ['planning', 'in_progress', 'on_hold', 'completed'] },
      priority: { column: 'priority', type: 'enum', values: ['low', 'medium', 'high', 'urgent'] },
      startDate: { column: 'start_date', type: 'date', nullable: true },
      dueDate: { column: 'due_date', type: 'date', nullable: true },
    },
    createFields: ['workspaceId', 'name', 'description', 'status', 'priority', 'startDate', 'dueDate'],
    updateFields: ['name', 'description', 'status', 'priority', 'startDate', 'dueDate'],
    requiredFields: ['workspaceId', 'name'],
    createdByColumn: 'created_by',
    authorizeCreate: (userId, values, database) => authorizeWorkspace(userId, values.workspaceId, database),
    orderBy: 'updated_at',
  },
  tasks: {
    singular: 'task', plural: 'tasks', table: 'tasks',
    scopeQuery: async (userId, database) => {
      const workspaceIds = await memberWorkspaceIds(userId, database);
      const projectIds = await database.collection('projects').distinct('id', {
        workspace_id: { $in: workspaceIds },
      });
      return { project_id: { $in: projectIds } };
    },
    fields: {
      projectId: { column: 'project_id', type: 'string', maxLength: 36, label: 'Project' },
      title: { column: 'title', type: 'string', maxLength: 200, label: 'Task title' },
      description: { column: 'description', type: 'string', maxLength: 50000, nullable: true },
      status: { column: 'status', type: 'enum', values: ['todo', 'in_progress', 'in_review', 'done'] },
      priority: { column: 'priority', type: 'enum', values: ['low', 'medium', 'high', 'urgent'] },
      assignedTo: { column: 'assigned_to', type: 'string', maxLength: 36, nullable: true },
      dueDate: { column: 'due_date', type: 'date', nullable: true },
      position: { column: 'position', type: 'integer' },
    },
    createFields: ['projectId', 'title', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'position'],
    updateFields: ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'position'],
    requiredFields: ['projectId', 'title'],
    createdByColumn: 'created_by',
    authorizeCreate: async (userId, values, database) => {
      const project = await database.collection('projects').findOne({ id: values.projectId });
      if (!project) throw ApiError.notFound('Project not found.');
      await authorizeWorkspace(userId, project.workspace_id, database);
      if (values.assignedTo) {
        const membership = await database.collection('workspace_members').findOne({
          workspace_id: project.workspace_id,
          user_id: values.assignedTo,
        });
        if (!membership) throw ApiError.badRequest('Assignee must be a member of the project workspace.');
      }
    },
    orderBy: 'updated_at',
  },
  notifications: {
    singular: 'notification', plural: 'notifications', table: 'notifications',
    scopeQuery: (userId) => ({ user_id: userId }),
    fields: {
      type: { column: 'type', type: 'string', maxLength: 60, label: 'Type' },
      title: { column: 'title', type: 'string', maxLength: 200, label: 'Title' },
      message: { column: 'message', type: 'string', maxLength: 5000, nullable: true },
    },
    createFields: ['type', 'title', 'message'],
    updateFields: [],
    requiredFields: ['type', 'title'],
    ownerColumn: 'user_id',
    orderBy: 'created_at',
  },
  users: {
    singular: 'user', plural: 'users', table: 'users',
    scopeQuery: (userId) => ({ id: userId }),
    fields: {
      name: { column: 'name', type: 'string', maxLength: 120, label: 'Name' },
      avatarUrl: { column: 'avatar_url', type: 'string', maxLength: 2048, nullable: true, url: true },
    },
    createFields: [],
    updateFields: ['name', 'avatarUrl'],
    requiredFields: [],
    orderBy: 'updated_at',
  },
  comments: {
    singular: 'comment', plural: 'comments', table: 'comments',
    scopeQuery: (userId) => ({ author_id: userId }),
    fields: {
      taskId: { column: 'task_id', type: 'string', maxLength: 36, nullable: true },
      projectId: { column: 'project_id', type: 'string', maxLength: 36, nullable: true },
      documentId: { column: 'document_id', type: 'string', maxLength: 36, nullable: true },
      content: { column: 'content', type: 'string', maxLength: 10000, label: 'Comment' },
    },
    createFields: ['taskId', 'projectId', 'documentId', 'content'],
    updateFields: ['content'],
    requiredFields: ['content'],
    createdByColumn: 'author_id',
    authorizeCreate: async (userId, values, database) => {
      const targets = ['taskId', 'projectId', 'documentId'].filter((key) => values[key]);
      if (targets.length !== 1) throw ApiError.badRequest('A comment must belong to exactly one task, project, or document.');
      const target = targets[0];
      let workspaceId;
      if (target === 'taskId') {
        const task = await database.collection('tasks').findOne({ id: values[target] });
        const project = task && await database.collection('projects').findOne({ id: task.project_id });
        workspaceId = project?.workspace_id;
      } else {
        const collection = target === 'projectId' ? 'projects' : 'documents';
        const entity = await database.collection(collection).findOne({ id: values[target] });
        workspaceId = entity?.workspace_id;
      }
      if (!workspaceId) throw ApiError.notFound('Comment target not found.');
      await authorizeWorkspace(userId, workspaceId, database);
    },
    orderBy: 'created_at',
  },
  invitations: {
    singular: 'invitation', plural: 'invitations', table: 'workspace_invitations',
    scopeQuery: async (userId, database) => ({ workspace_id: { $in: await memberWorkspaceIds(userId, database) } }),
    fields: {
      workspaceId: { column: 'workspace_id', type: 'string', maxLength: 36, label: 'Workspace' },
      email: { column: 'email', type: 'string', maxLength: 255, label: 'Email' },
      role: { column: 'role', type: 'enum', values: ['admin', 'member'] },
      tokenHash: { column: 'token_hash', type: 'string', maxLength: 64, label: 'Token hash' },
      status: { column: 'status', type: 'enum', values: ['pending', 'accepted', 'revoked', 'expired'] },
      expiresAt: { column: 'expires_at', type: 'date', label: 'Expiry date' },
    },
    createFields: ['workspaceId', 'email', 'role', 'tokenHash', 'expiresAt'],
    updateFields: ['role', 'status'],
    requiredFields: ['workspaceId', 'email', 'role', 'tokenHash', 'expiresAt'],
    createdByColumn: 'invited_by',
    authorizeCreate: (userId, values, database) => authorizeWorkspace(userId, values.workspaceId, database, 'admin'),
    orderBy: 'created_at',
  },
  activity: {
    singular: 'activity', plural: 'activity', table: 'activity_logs',
    scopeQuery: async (userId, database) => ({ workspace_id: { $in: await memberWorkspaceIds(userId, database) } }),
    fields: {
      workspaceId: { column: 'workspace_id', type: 'string', maxLength: 36 },
      action: { column: 'action', type: 'string', maxLength: 80 },
      entityType: { column: 'entity_type', type: 'string', maxLength: 40 },
      entityId: { column: 'entity_id', type: 'string', maxLength: 36, nullable: true },
    },
    createFields: ['workspaceId', 'action', 'entityType', 'entityId'],
    updateFields: [],
    requiredFields: ['workspaceId', 'action', 'entityType'],
    createdByColumn: 'actor_id',
    authorizeCreate: (userId, values, database) => authorizeWorkspace(userId, values.workspaceId, database),
    orderBy: 'created_at',
  },
};

module.exports = Object.freeze(definitions);
