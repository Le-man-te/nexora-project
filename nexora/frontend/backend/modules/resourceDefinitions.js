const { getPool } = require('../database/pools');
const ApiError = require('../utils/ApiErroir');

const workspaceMember = (alias = 'r') => (
  `EXISTS (SELECT 1 FROM workspace_members wm WHERE wm.workspace_id = ${alias}.workspace_id AND wm.user_id = ?)`
);

async function authorizeWorkspace(userId, workspaceId, pool = getPool(), minimumRole = 'member') {
  const [rows] = await pool.execute(
    `SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1`,
    [workspaceId, userId],
  );
  if (rows.length === 0) throw ApiError.notFound('Workspace not found.');
  if (minimumRole === 'admin' && !['owner', 'admin'].includes(rows[0].role)) {
    throw ApiError.forbidden('Workspace administrator permission is required.');
  }
}

const definitions = {
  notes: {
    singular: 'note', plural: 'notes', table: 'notes', scopeSql: workspaceMember(),
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
    authorizeCreate: (userId, values, pool) => authorizeWorkspace(userId, values.workspaceId, pool),
    orderBy: 'updated_at',
  },
  documents: {
    singular: 'document', plural: 'documents', table: 'documents', scopeSql: workspaceMember(),
    fields: {
      workspaceId: { column: 'workspace_id', type: 'string', maxLength: 36, label: 'Workspace' },
      title: { column: 'title', type: 'string', maxLength: 200, label: 'Title' },
      content: { column: 'content', type: 'string', maxLength: 50000, nullable: true, label: 'Content' },
    },
    createFields: ['workspaceId', 'title', 'content'],
    updateFields: ['title', 'content'],
    requiredFields: ['workspaceId', 'title'],
    createdByColumn: 'created_by',
    authorizeCreate: (userId, values, pool) => authorizeWorkspace(userId, values.workspaceId, pool),
    orderBy: 'updated_at',
  },
  projects: {
    singular: 'project', plural: 'projects', table: 'projects', scopeSql: workspaceMember(),
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
    authorizeCreate: (userId, values, pool) => authorizeWorkspace(userId, values.workspaceId, pool),
    orderBy: 'updated_at',
  },
  tasks: {
    singular: 'task', plural: 'tasks', table: 'tasks',
    scopeSql: 'EXISTS (SELECT 1 FROM projects p JOIN workspace_members wm ON wm.workspace_id = p.workspace_id WHERE p.id = r.project_id AND wm.user_id = ?)',
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
    authorizeCreate: async (userId, values, pool) => {
      const [rows] = await pool.execute(
        `SELECT p.id FROM projects p JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
         WHERE p.id = ? AND wm.user_id = ? LIMIT 1`,
        [values.projectId, userId],
      );
      if (rows.length === 0) throw ApiError.notFound('Project not found.');
      if (values.assignedTo) {
        const [assignees] = await pool.execute(
          `SELECT 1 FROM projects p JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
           WHERE p.id = ? AND wm.user_id = ? LIMIT 1`,
          [values.projectId, values.assignedTo],
        );
        if (assignees.length === 0) throw ApiError.badRequest('Assignee must be a member of the project workspace.');
      }
    },
    orderBy: 'updated_at',
  },
  notifications: {
    singular: 'notification', plural: 'notifications', table: 'notifications', scopeSql: 'r.user_id = ?',
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
    singular: 'user', plural: 'users', table: 'users', scopeSql: 'r.id = ?',
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
    singular: 'comment', plural: 'comments', table: 'comments', scopeSql: 'r.author_id = ?',
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
    authorizeCreate: async (userId, values, pool) => {
      const targets = ['taskId', 'projectId', 'documentId'].filter((key) => values[key]);
      if (targets.length !== 1) throw ApiError.badRequest('A comment must belong to exactly one task, project, or document.');
      const queries = {
        taskId: `SELECT t.id FROM tasks t JOIN projects p ON p.id = t.project_id
                 JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
                 WHERE t.id = ? AND wm.user_id = ? LIMIT 1`,
        projectId: `SELECT p.id FROM projects p JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
                    WHERE p.id = ? AND wm.user_id = ? LIMIT 1`,
        documentId: `SELECT d.id FROM documents d JOIN workspace_members wm ON wm.workspace_id = d.workspace_id
                     WHERE d.id = ? AND wm.user_id = ? LIMIT 1`,
      };
      const [rows] = await pool.execute(queries[targets[0]], [values[targets[0]], userId]);
      if (rows.length === 0) throw ApiError.notFound('Comment target not found.');
    },
    orderBy: 'created_at',
  },
  invitations: {
    singular: 'invitation', plural: 'invitations', table: 'workspace_invitations',
    scopeSql: workspaceMember(),
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
    authorizeCreate: (userId, values, pool) => authorizeWorkspace(userId, values.workspaceId, pool, 'admin'),
    orderBy: 'created_at',
  },
  activity: {
    singular: 'activity', plural: 'activity', table: 'activity_logs',
    scopeSql: workspaceMember(),
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
    authorizeCreate: (userId, values, pool) => authorizeWorkspace(userId, values.workspaceId, pool),
    orderBy: 'created_at',
  },
};

module.exports = Object.freeze(definitions);
