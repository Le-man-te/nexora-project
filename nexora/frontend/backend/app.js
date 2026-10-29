const {
  randomUUID,
} = require('node:crypto');
const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');
const env = require('./config/env');
const { getMongoDatabase } = require('./database/mongo');
const { removeProject, removeWorkspace } = require('./database/cleanup');
const sessionService = require('./services/sessionService');
const { hashPassword, verifyPassword } = require('./security/password');
const requestLogger = require('./middleware/requestLogger');
const authRateLimit = require('./middleware/rateLimit')({ windowMs: 15 * 60 * 1000, max: 10 });
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const validateUpload = require('./middleware/upload');
const uploadRateLimit = require('./middleware/rateLimit')({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: (req) => req.user.id,
  message: 'Upload limit reached. Please try again later.',
});
const requireAuth = require('./middleware/requireAuth');
const csrfProtection = require('./security/csrf');
const uploadService = require('./services/uploadService');

const app = express();
const SESSION_COOKIE = env.sessionCookieName;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_PROJECT_STATUSES = new Set(['planning', 'in_progress', 'on_hold', 'completed']);
const VALID_PRIORITIES = new Set(['low', 'medium', 'high', 'urgent']);
const VALID_TASK_STATUSES = new Set(['todo', 'in_progress', 'in_review', 'done']);
const DUMMY_PASSWORD_HASH = `${'0'.repeat(32)}:${'0'.repeat(128)}`;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function getCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const item of header.split(';')) {
    const separator = item.indexOf('=');
    if (separator === -1) continue;
    if (item.slice(0, separator).trim() === name) {
      return item.slice(separator + 1).trim();
    }
  }
  return null;
}

function setSessionCookie(res, token, maxAge) {
  const secure = env.nodeEnv === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`,
  );
}

function clearSessionCookie(res) {
  const secure = env.nodeEnv === 'production' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
}

function userPayload(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url || null,
  };
}

function workspacePayload(workspace) {
  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    description: workspace.description,
    teamSize: workspace.team_size,
    visibility: workspace.visibility,
    memberInvites: Boolean(workspace.member_invites),
    role: workspace.role,
    archivedAt: workspace.archived_at,
    createdAt: workspace.created_at,
    updatedAt: workspace.updated_at,
  };
}

function projectPayload(project) {
  return {
    id: project.id,
    workspaceId: project.workspace_id,
    name: project.name,
    description: project.description,
    status: project.status,
    priority: project.priority,
    startDate: project.start_date,
    dueDate: project.due_date,
    createdBy: project.created_by,
    archivedAt: project.archived_at,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  };
}

function taskPayload(task) {
  return {
    id: task.id,
    projectId: task.project_id,
    createdBy: task.created_by,
    assignedTo: task.assigned_to,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.due_date,
    position: task.position,
    completedAt: task.completed_at,
    createdAt: task.created_at,
    updatedAt: task.updated_at,
  };
}

function requireText(value, label, maximum) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${label} is required.`);
  }
  const normalized = value.trim();
  if (normalized.length > maximum) {
    throw new HttpError(400, `${label} must be ${maximum} characters or fewer.`);
  }
  return normalized;
}

async function requireWorkspaceMember(workspaceId, userId, minimumRole = 'member') {
  const database = getMongoDatabase();
  const membership = await database.collection('workspace_members').findOne({
    workspace_id: workspaceId,
    user_id: userId,
  });
  const workspace = await database.collection('workspaces').findOne({
    id: workspaceId,
    archived_at: null,
  });
  if (!membership || !workspace) throw new HttpError(404, 'Workspace not found.');
  if (minimumRole === 'admin' && !['owner', 'admin'].includes(membership.role)) {
    throw new HttpError(403, 'Workspace administrator permission is required.');
  }
  return { ...workspace, role: membership.role };
}

async function requireProjectMember(projectId, userId) {
  const database = getMongoDatabase();
  const project = await database.collection('projects').findOne({ id: projectId });
  if (!project) throw new HttpError(404, 'Project not found.');
  const membership = await database.collection('workspace_members').findOne({
    workspace_id: project.workspace_id,
    user_id: userId,
  });
  if (!membership) throw new HttpError(404, 'Project not found.');
  return project;
}

async function assertProjectAssignee(projectId, assigneeId) {
  if (assigneeId === null || assigneeId === undefined || assigneeId === '') return;
  const database = getMongoDatabase();
  const project = await database.collection('projects').findOne({ id: projectId });
  const membership = project && await database.collection('workspace_members').findOne({
    workspace_id: project.workspace_id,
    user_id: assigneeId,
  });
  if (!membership) throw new HttpError(400, 'Assignee must be a member of the project workspace.');
}

async function requireTaskMember(taskId, userId) {
  const database = getMongoDatabase();
  const task = await database.collection('tasks').findOne({ id: taskId });
  const project = task && await database.collection('projects').findOne({ id: task.project_id });
  const membership = project && await database.collection('workspace_members').findOne({
    workspace_id: project.workspace_id,
    user_id: userId,
  });
  if (!task || !membership) throw new HttpError(404, 'Task not found.');
  return task;
}

app.disable('x-powered-by');
if (env.trustProxy) app.set('trust proxy', 1);
app.use(requestLogger);
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use((req, _res, next) => {
  if (req.body === undefined) req.body = {};
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    next(new HttpError(400, 'Request body must be a JSON object.'));
    return;
  }
  next();
});
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.use('/api', csrfProtection);

app.get(['/health', '/api/health'], (_req, res) => {
  res.json({ ok: true, service: 'nexora-backend', timestamp: new Date().toISOString() });
});

app.get('/ready', async (_req, res, next) => {
  try {
    await getMongoDatabase().command({ ping: 1 });
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/register', authRateLimit, async (req, res) => {
  const name = requireText(req.body?.name, 'Name', 120);
  const email = requireText(req.body?.email, 'Email', 255).toLowerCase();
  const password = req.body?.password;
  if (!EMAIL_PATTERN.test(email)) throw new HttpError(400, 'Enter a valid email address.');
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new HttpError(400, 'Password must be between 8 and 128 characters.');
  }
  if (req.body?.acceptedTerms !== true) throw new HttpError(400, 'You must accept the Terms and Privacy Policy.');

  const userId = randomUUID();
  try {
    const now = new Date();
    await getMongoDatabase().collection('users').insertOne({
      id: userId,
      name,
      email,
      password_hash: await hashPassword(password),
      avatar_url: null,
      created_at: now,
      updated_at: now,
    });
  } catch (error) {
    if (error.code === 11000) throw new HttpError(409, 'An account with this email already exists.');
    throw error;
  }
  const user = { id: userId, name, email, avatar_url: null };
  await createSession(res, userId);
  res.status(201).json({ message: 'Registration successful.', user: userPayload(user) });
});

async function createSession(res, userId) {
  const session = await sessionService.createSession(userId);
  setSessionCookie(res, session.token, session.maxAge);
}

app.post('/api/auth/login', authRateLimit, async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  if (!EMAIL_PATTERN.test(email) || typeof password !== 'string' || !password) {
    throw new HttpError(400, 'A valid email and password are required.');
  }
  const user = await getMongoDatabase().collection('users').findOne(
    { email },
    { projection: { id: 1, name: 1, email: 1, password_hash: 1, avatar_url: 1, disabled_at: 1 } },
  );
  const passwordMatches = await verifyPassword(password, user?.password_hash || DUMMY_PASSWORD_HASH);
  if (!user || !passwordMatches) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }
  if (user.disabled_at) throw new HttpError(403, 'This account has been disabled.');
  await createSession(res, user.id);
  res.json({ message: 'Login successful.', user: userPayload(user) });
});

app.post('/api/auth/logout', async (req, res) => {
  const token = getCookie(req, SESSION_COOKIE);
  if (token) {
    await sessionService.revokeSession(token);
  }
  clearSessionCookie(res);
  res.json({ message: 'Logged out successfully.' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: userPayload(req.user) });
});

app.use('/api/workspaces', requireAuth);

app.get('/api/workspaces', async (req, res) => {
  const database = getMongoDatabase();
  const memberships = await database.collection('workspace_members')
    .find({ user_id: req.user.id })
    .toArray();
  const roles = new Map(memberships.map(({ workspace_id, role }) => [workspace_id, role]));
  const rows = await database.collection('workspaces')
    .find({ id: { $in: [...roles.keys()] }, archived_at: null })
    .sort({ created_at: 1 })
    .toArray();
  res.json({ workspaces: rows.map((workspace) => workspacePayload({
    ...workspace,
    role: roles.get(workspace.id),
  })) });
});

app.post('/api/workspaces', async (req, res) => {
  const name = requireText(req.body?.name, 'Workspace name', 60);
  const slug = requireText(req.body?.slug, 'Workspace URL', 48);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new HttpError(400, 'Workspace URL must use lowercase letters and numbers separated by single hyphens.');
  }
  const visibility = req.body?.visibility || 'private';
  if (!['private', 'invite-only'].includes(visibility)) throw new HttpError(400, 'Choose a valid workspace visibility.');
  const id = randomUUID();

  try {
    const now = new Date();
    await getMongoDatabase().collection('workspaces').insertOne({
      id,
      name,
      slug,
      description: req.body.description || null,
      team_size: req.body.teamSize || null,
      visibility,
      member_invites: req.body.memberInvites !== false,
      created_by: req.user.id,
      created_at: now,
      updated_at: now,
      archived_at: null,
    });
    try {
      await getMongoDatabase().collection('workspace_members').insertOne({
        id: randomUUID(),
        workspace_id: id,
        user_id: req.user.id,
        role: 'owner',
        created_at: now,
      });
    } catch (error) {
      await getMongoDatabase().collection('workspaces').deleteOne({ id });
      throw error;
    }
  } catch (error) {
    if (error.code === 11000) throw new HttpError(409, 'That workspace URL is already in use.');
    throw error;
  }
  const workspace = await requireWorkspaceMember(id, req.user.id);
  res.status(201).json({ workspace: workspacePayload(workspace) });
});

app.get('/api/workspaces/:id', async (req, res) => {
  const workspace = await requireWorkspaceMember(req.params.id, req.user.id);
  res.json({ workspace: workspacePayload(workspace) });
});

app.patch('/api/workspaces/:id', async (req, res) => {
  const workspace = await requireWorkspaceMember(req.params.id, req.user.id, 'admin');
  const fields = {
    name: ['name', (value) => requireText(value, 'Workspace name', 60)],
    slug: ['slug', (value) => {
      const slug = requireText(value, 'Workspace URL', 48);
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new HttpError(400, 'Workspace URL is invalid.');
      return slug;
    }],
    description: ['description', (value) => value === null ? null : requireText(value, 'Description', 180)],
    teamSize: ['team_size', (value) => value],
    visibility: ['visibility', (value) => {
      if (!['private', 'invite-only'].includes(value)) throw new HttpError(400, 'Choose a valid workspace visibility.');
      return value;
    }],
    memberInvites: ['member_invites', (value) => {
      if (typeof value !== 'boolean') throw new HttpError(400, 'Member invitation permission must be true or false.');
      return value;
    }],
  };
  const updates = {};
  for (const [key, [column, validate]] of Object.entries(fields)) {
    if (Object.hasOwn(req.body || {}, key)) {
      updates[column] = validate(req.body[key]);
    }
  }
  if (Object.keys(updates).length === 0) throw new HttpError(400, 'No valid workspace changes were provided.');
  try {
    updates.updated_at = new Date();
    await getMongoDatabase().collection('workspaces').updateOne({ id: workspace.id }, { $set: updates });
  } catch (error) {
    if (error.code === 11000) throw new HttpError(409, 'That workspace URL is already in use.');
    throw error;
  }
  res.json({ workspace: workspacePayload(await requireWorkspaceMember(workspace.id, req.user.id)) });
});

app.post('/api/workspaces/:id/archive', async (req, res) => {
  const workspace = await requireWorkspaceMember(req.params.id, req.user.id, 'admin');
  await getMongoDatabase().collection('workspaces').updateOne(
    { id: workspace.id },
    { $set: { archived_at: new Date(), updated_at: new Date() } },
  );
  res.json({ message: 'Workspace archived successfully.' });
});

app.delete('/api/workspaces/:id', async (req, res) => {
  const workspace = await requireWorkspaceMember(req.params.id, req.user.id, 'admin');
  if (workspace.role !== 'owner') throw new HttpError(403, 'Only a workspace owner can delete it.');
  await removeWorkspace(getMongoDatabase(), workspace.id);
  res.json({ message: 'Workspace deleted successfully.' });
});

app.get('/api/workspaces/:id/members', async (req, res) => {
  await requireWorkspaceMember(req.params.id, req.user.id);
  const database = getMongoDatabase();
  const memberships = await database.collection('workspace_members')
    .find({ workspace_id: req.params.id })
    .sort({ created_at: 1 })
    .toArray();
  const users = await database.collection('users')
    .find({ id: { $in: memberships.map(({ user_id }) => user_id) } })
    .toArray();
  const usersById = new Map(users.map((user) => [user.id, user]));
  res.json({
    members: memberships.flatMap((membership) => {
      const user = usersById.get(membership.user_id);
      return user ? [{
        ...userPayload(user),
        role: membership.role,
        joinedAt: membership.created_at,
      }] : [];
    }),
  });
});

app.use('/api/projects', requireAuth);
app.use('/api/projects/archived', requireAuth);

app.get('/api/projects/archived', async (req, res) => {
  const workspaceId = req.query.workspaceId;
  const memberIds = await getMongoDatabase().collection('workspace_members')
    .distinct('workspace_id', { user_id: req.user.id });
  const filter = { workspace_id: { $in: memberIds }, archived_at: { $ne: null } };
  if (workspaceId) filter.workspace_id = { $in: memberIds.includes(workspaceId) ? [workspaceId] : [] };
  const rows = await getMongoDatabase().collection('projects').find(filter).sort({ updated_at: -1 }).toArray();
  res.json({ projects: rows.map(projectPayload) });
});

app.get('/api/projects', async (req, res) => {
  const workspaceId = req.query.workspaceId;
  const memberIds = await getMongoDatabase().collection('workspace_members')
    .distinct('workspace_id', { user_id: req.user.id });
  const filter = { workspace_id: { $in: memberIds }, archived_at: null };
  if (workspaceId) filter.workspace_id = { $in: memberIds.includes(workspaceId) ? [workspaceId] : [] };
  const rows = await getMongoDatabase().collection('projects').find(filter).sort({ updated_at: -1 }).toArray();
  res.json({ projects: rows.map(projectPayload) });
});

app.post('/api/projects', async (req, res) => {
  const workspaceId = requireText(req.body?.workspaceId, 'Workspace', 36);
  await requireWorkspaceMember(workspaceId, req.user.id);
  const name = requireText(req.body?.name, 'Project name', 160);
  const status = req.body?.status || 'planning';
  const priority = req.body?.priority || 'medium';
  if (!VALID_PROJECT_STATUSES.has(status)) throw new HttpError(400, 'Choose a valid project status.');
  if (!VALID_PRIORITIES.has(priority)) throw new HttpError(400, 'Choose a valid project priority.');
  const id = randomUUID();
  const now = new Date();
  const project = {
    id,
    workspace_id: workspaceId,
    created_by: req.user.id,
    name,
    description: req.body.description || null,
    status,
    priority,
    start_date: req.body.startDate || null,
    due_date: req.body.dueDate || null,
    archived_at: null,
    created_at: now,
    updated_at: now,
  };
  await getMongoDatabase().collection('projects').insertOne(project);
  res.status(201).json({ project: projectPayload(project), message: 'Project created successfully.' });
});

app.get('/api/projects/:id', async (req, res) => {
  const project = await requireProjectMember(req.params.id, req.user.id);
  res.json({ project: projectPayload(project) });
});

app.patch('/api/projects/:id', async (req, res) => {
  const project = await requireProjectMember(req.params.id, req.user.id);
  const fields = {
    name: ['name', (value) => requireText(value, 'Project name', 160)],
    description: ['description', (value) => value === null ? null : String(value)],
    status: ['status', (value) => {
      if (!VALID_PROJECT_STATUSES.has(value)) throw new HttpError(400, 'Choose a valid project status.');
      return value;
    }],
    priority: ['priority', (value) => {
      if (!VALID_PRIORITIES.has(value)) throw new HttpError(400, 'Choose a valid project priority.');
      return value;
    }],
    startDate: ['start_date', (value) => value || null],
    dueDate: ['due_date', (value) => value || null],
  };
  const updates = {};
  for (const [key, [column, validate]] of Object.entries(fields)) {
    if (Object.hasOwn(req.body || {}, key)) {
      updates[column] = validate(req.body[key]);
    }
  }
  if (Object.keys(updates).length === 0) throw new HttpError(400, 'No valid project changes were provided.');
  updates.updated_at = new Date();
  await getMongoDatabase().collection('projects').updateOne({ id: project.id }, { $set: updates });
  res.json({
    project: projectPayload(await getMongoDatabase().collection('projects').findOne({ id: project.id })),
    message: 'Project updated successfully.',
  });
});

app.post('/api/projects/:id/archive', async (req, res) => {
  const project = await requireProjectMember(req.params.id, req.user.id);
  await getMongoDatabase().collection('projects').updateOne(
    { id: project.id },
    { $set: { archived_at: new Date(), updated_at: new Date() } },
  );
  res.json({ message: 'Project archived successfully.' });
});

app.post('/api/projects/:id/restore', async (req, res) => {
  const project = await requireProjectMember(req.params.id, req.user.id);
  await getMongoDatabase().collection('projects').updateOne(
    { id: project.id },
    { $set: { archived_at: null, updated_at: new Date() } },
  );
  res.json({ message: 'Project restored successfully.' });
});

app.delete('/api/projects/:id', async (req, res) => {
  const project = await requireProjectMember(req.params.id, req.user.id);
  await removeProject(getMongoDatabase(), project.id);
  res.json({ message: 'Project deleted successfully.' });
});

app.get('/api/tasks', requireAuth, async (req, res) => {
  const { projectId, workspaceId } = req.query;
  const database = getMongoDatabase();
  const workspaceIds = await database.collection('workspace_members')
    .distinct('workspace_id', { user_id: req.user.id });
  const projectIds = await database.collection('projects').distinct('id', {
    workspace_id: { $in: workspaceIds },
  });
  let visibleProjectIds = projectIds;
  if (projectId) {
    await requireProjectMember(projectId, req.user.id);
    visibleProjectIds = projectIds.includes(projectId) ? [projectId] : [];
  } else if (workspaceId) {
    await requireWorkspaceMember(workspaceId, req.user.id);
    visibleProjectIds = await database.collection('projects').distinct('id', { workspace_id: workspaceId });
    visibleProjectIds = visibleProjectIds.filter((id) => projectIds.includes(id));
  }
  const rows = await database.collection('tasks')
    .find({ project_id: { $in: visibleProjectIds } })
    .sort({ position: 1, created_at: -1 })
    .toArray();
  res.json({ tasks: rows.map(taskPayload) });
});

app.post('/api/tasks', requireAuth, async (req, res) => {
  const projectId = requireText(req.body?.projectId, 'Project', 36);
  await requireProjectMember(projectId, req.user.id);
  const title = requireText(req.body?.title, 'Task title', 200);
  const status = req.body?.status || 'todo';
  const priority = req.body?.priority || 'medium';
  if (!VALID_TASK_STATUSES.has(status)) throw new HttpError(400, 'Choose a valid task status.');
  if (!VALID_PRIORITIES.has(priority)) throw new HttpError(400, 'Choose a valid task priority.');
  await assertProjectAssignee(projectId, req.body.assignedTo);
  const id = randomUUID();
  const now = new Date();
  const task = {
    id,
    project_id: projectId,
    created_by: req.user.id,
    assigned_to: req.body.assignedTo || null,
    title,
    description: req.body.description || null,
    status,
    priority,
    due_date: req.body.dueDate || null,
    position: Number.isInteger(req.body.position) ? req.body.position : 0,
    completed_at: null,
    created_at: now,
    updated_at: now,
  };
  await getMongoDatabase().collection('tasks').insertOne(task);
  res.status(201).json({ task: taskPayload(task), message: 'Task created successfully.' });
});

app.get('/api/tasks/:id', requireAuth, async (req, res) => {
  const task = await requireTaskMember(req.params.id, req.user.id);
  res.json({ task: taskPayload(task) });
});

app.patch('/api/tasks/:id', requireAuth, async (req, res) => {
  const task = await requireTaskMember(req.params.id, req.user.id);
  const fields = {
    title: ['title', (value) => requireText(value, 'Task title', 200)],
    description: ['description', (value) => value === null ? null : String(value)],
    assignedTo: ['assigned_to', (value) => value || null],
    status: ['status', (value) => {
      if (!VALID_TASK_STATUSES.has(value)) throw new HttpError(400, 'Choose a valid task status.');
      return value;
    }],
    priority: ['priority', (value) => {
      if (!VALID_PRIORITIES.has(value)) throw new HttpError(400, 'Choose a valid task priority.');
      return value;
    }],
    dueDate: ['due_date', (value) => value || null],
    position: ['position', (value) => {
      if (!Number.isInteger(value)) throw new HttpError(400, 'Task position must be an integer.');
      return value;
    }],
  };
  const updates = {};
  for (const [key, [column, validate]] of Object.entries(fields)) {
    if (Object.hasOwn(req.body || {}, key)) {
      updates[column] = validate(req.body[key]);
    }
  }
  if (Object.keys(updates).length === 0) throw new HttpError(400, 'No valid task changes were provided.');
  if (Object.hasOwn(req.body, 'status')) {
    updates.completed_at = req.body.status === 'done' ? (task.completed_at || new Date()) : null;
  }
  if (Object.hasOwn(req.body, 'assignedTo')) {
    await assertProjectAssignee(task.project_id, req.body.assignedTo);
  }
  updates.updated_at = new Date();
  await getMongoDatabase().collection('tasks').updateOne({ id: task.id }, { $set: updates });
  res.json({
    task: taskPayload(await getMongoDatabase().collection('tasks').findOne({ id: task.id })),
    message: 'Task updated successfully.',
  });
});

app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
  const task = await requireTaskMember(req.params.id, req.user.id);
  const database = getMongoDatabase();
  await Promise.all([
    database.collection('subtasks').deleteMany({ task_id: task.id }),
    database.collection('task_labels').deleteMany({ task_id: task.id }),
    database.collection('comments').deleteMany({ task_id: task.id }),
  ]);
  await database.collection('tasks').deleteOne({ id: task.id });
  res.json({ message: 'Task deleted successfully.' });
});

app.post('/api/tasks/:id/subtasks', requireAuth, async (req, res) => {
  const task = await requireTaskMember(req.params.id, req.user.id);
  const title = requireText(req.body?.title, 'Subtask title', 200);
  const id = randomUUID();
  const subtask = {
    id,
    task_id: task.id,
    title,
    position: Number.isInteger(req.body.position) ? req.body.position : 0,
    is_completed: false,
    created_at: new Date(),
  };
  await getMongoDatabase().collection('subtasks').insertOne(subtask);
  res.status(201).json({ subtask });
});

app.patch('/api/tasks/:id/subtasks/:subtaskId', requireAuth, async (req, res) => {
  const task = await requireTaskMember(req.params.id, req.user.id);
  const updates = {};
  if (Object.hasOwn(req.body || {}, 'title')) {
    updates.title = requireText(req.body.title, 'Subtask title', 200);
  }
  if (Object.hasOwn(req.body || {}, 'isCompleted')) {
    if (typeof req.body.isCompleted !== 'boolean') throw new HttpError(400, 'Subtask completion must be true or false.');
    updates.is_completed = req.body.isCompleted;
  }
  if (Object.keys(updates).length === 0) throw new HttpError(400, 'No valid subtask changes were provided.');
  const database = getMongoDatabase();
  const result = await database.collection('subtasks').updateOne(
    { id: req.params.subtaskId, task_id: task.id },
    { $set: updates },
  );
  if (result.matchedCount === 0) throw new HttpError(404, 'Subtask not found.');
  res.json({
    subtask: await database.collection('subtasks').findOne({
      id: req.params.subtaskId,
      task_id: task.id,
    }, { projection: { _id: 0 } }),
  });
});

app.delete('/api/tasks/:id/subtasks/:subtaskId', requireAuth, async (req, res) => {
  const task = await requireTaskMember(req.params.id, req.user.id);
  const result = await getMongoDatabase().collection('subtasks').deleteOne({
    id: req.params.subtaskId,
    task_id: task.id,
  });
  if (result.deletedCount === 0) throw new HttpError(404, 'Subtask not found.');
  res.json({ message: 'Subtask deleted successfully.' });
});

app.get('/api/search', requireAuth, async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!query) throw new HttpError(400, 'Search query is required.');
  if (query.length > 120) throw new HttpError(400, 'Search query must be 120 characters or fewer.');
  const database = getMongoDatabase();
  const workspaceIds = await database.collection('workspace_members')
    .distinct('workspace_id', { user_id: req.user.id });
  const searchPattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const [projectDocs, workspaceDocs] = await Promise.all([
    database.collection('projects').find({
      workspace_id: { $in: workspaceIds },
      archived_at: null,
      $or: [{ name: searchPattern }, { description: searchPattern }],
    }).limit(20).toArray(),
    database.collection('workspaces').find({
      id: { $in: workspaceIds },
      archived_at: null,
      $or: [{ name: searchPattern }, { description: searchPattern }],
    }).limit(20).toArray(),
  ]);
  const projects = projectDocs.map(({ id, name, description }) => ({ id, type: 'Project', title: name, description }));
  const workspaces = workspaceDocs.map(({ id, name, description }) => ({ id, type: 'Workspace', title: name, description }));
  const results = [...projects, ...workspaces].map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description || '',
  }));
  res.json({ results, total: results.length, query });
});

app.post('/api/uploads', requireAuth, uploadRateLimit, validateUpload(), async (req, res) => {
  const uploads = await uploadService.saveUploads(req.user.id, req.uploadFiles);
  res.status(201).json(uploads.length === 1
    ? { ...uploads[0], message: 'Upload successful.' }
    : { uploads, message: 'Uploads successful.' });
});

app.get('/api/uploads/:id', requireAuth, async (req, res) => {
  const file = await uploadService.getUpload(req.user.id, req.params.id);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', String(file.size));
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(file.originalName)}`);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.send(file.buffer);
});

app.use('/api/auth', require('./modules/auth/auth.routes'));
app.use('/api/notes', require('./modules/notes/notes.routes'));
app.use('/api/documents', require('./modules/documents/documents.routes'));
app.use('/api/users', require('./modules/users/users.routes'));
app.use('/api/notifications', require('./modules/notifications/notification.routes'));
app.use('/api/ai', require('./modules/ai/ai.routes'));
app.use('/api/analytics', require('./modules/analytics/analytics.routes'));
app.use('/api/collaborations', require('./modules/collaboration/commets.routes'));
app.use('/api/settings', require('./modules/settings/settings.routes'));
app.use('/api/admin', require('./modules/admin/admin.routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;