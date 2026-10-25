const {
  randomUUID,
  createHash,
} = require('node:crypto');
const express = require('express');
const cors = require('cors');
const corsOptions = require('./config/cors');
const env = require('./config/env');
const { getPool } = require('./database/pools');
const { withTransaction } = require('./database/transaction');
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

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
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
  const [rows] = await getPool().execute(
    `SELECT w.*, wm.role
     FROM workspaces w
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE w.id = ? AND wm.user_id = ? AND w.archived_at IS NULL
     LIMIT 1`,
    [workspaceId, userId],
  );
  if (rows.length === 0) throw new HttpError(404, 'Workspace not found.');
  if (minimumRole === 'admin' && !['owner', 'admin'].includes(rows[0].role)) {
    throw new HttpError(403, 'Workspace administrator permission is required.');
  }
  return rows[0];
}

async function requireProjectMember(projectId, userId) {
  const [rows] = await getPool().execute(
    `SELECT p.* FROM projects p
     JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
     WHERE p.id = ? AND wm.user_id = ? LIMIT 1`,
    [projectId, userId],
  );
  if (rows.length === 0) throw new HttpError(404, 'Project not found.');
  return rows[0];
}

async function assertProjectAssignee(projectId, assigneeId) {
  if (assigneeId === null || assigneeId === undefined || assigneeId === '') return;
  const [rows] = await getPool().execute(
    `SELECT 1 FROM projects p
     JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
     WHERE p.id = ? AND wm.user_id = ? LIMIT 1`,
    [projectId, assigneeId],
  );
  if (rows.length === 0) throw new HttpError(400, 'Assignee must be a member of the project workspace.');
}

async function requireTaskMember(taskId, userId) {
  const [rows] = await getPool().execute(
    `SELECT t.* FROM tasks t
     JOIN projects p ON p.id = t.project_id
     JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
     WHERE t.id = ? AND wm.user_id = ? LIMIT 1`,
    [taskId, userId],
  );
  if (rows.length === 0) throw new HttpError(404, 'Task not found.');
  return rows[0];
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
    await getPool().query('SELECT 1');
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
    await getPool().execute(
      'INSERT INTO users (id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [userId, name, email, await hashPassword(password)],
    );
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'An account with this email already exists.');
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
  const [rows] = await getPool().execute(
    'SELECT id, name, email, password_hash, avatar_url FROM users WHERE email = ? LIMIT 1',
    [email],
  );
  const user = rows[0];
  const passwordMatches = await verifyPassword(password, user?.password_hash || DUMMY_PASSWORD_HASH);
  if (!user || !passwordMatches) {
    throw new HttpError(401, 'Email or password is incorrect.');
  }
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
  const [rows] = await getPool().execute(
    `SELECT w.*, wm.role FROM workspaces w
     JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE wm.user_id = ? AND w.archived_at IS NULL ORDER BY w.created_at`,
    [req.user.id],
  );
  res.json({ workspaces: rows.map(workspacePayload) });
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
    await withTransaction(getPool(), async (connection) => {
      await connection.execute(
        `INSERT INTO workspaces (id, name, slug, description, team_size, visibility, member_invites, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, name, slug, req.body.description || null, req.body.teamSize || null,
          visibility, req.body.memberInvites === false ? 0 : 1, req.user.id,
        ],
      );
      await connection.execute(
        "INSERT INTO workspace_members (id, workspace_id, user_id, role) VALUES (?, ?, ?, 'owner')",
        [randomUUID(), id, req.user.id],
      );
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'That workspace URL is already in use.');
    throw error;
  }
  const [rows] = await getPool().execute(
    `SELECT w.*, wm.role FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE w.id = ? AND wm.user_id = ?`,
    [id, req.user.id],
  );
  res.status(201).json({ workspace: workspacePayload(rows[0]) });
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
      return value ? 1 : 0;
    }],
  };
  const updates = [];
  const values = [];
  for (const [key, [column, validate]] of Object.entries(fields)) {
    if (Object.hasOwn(req.body || {}, key)) {
      updates.push(`${column} = ?`);
      values.push(validate(req.body[key]));
    }
  }
  if (updates.length === 0) throw new HttpError(400, 'No valid workspace changes were provided.');
  try {
    await getPool().execute(`UPDATE workspaces SET ${updates.join(', ')} WHERE id = ?`, [...values, workspace.id]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'That workspace URL is already in use.');
    throw error;
  }
  const [rows] = await getPool().execute(
    `SELECT w.*, wm.role FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE w.id = ? AND wm.user_id = ?`,
    [workspace.id, req.user.id],
  );
  res.json({ workspace: workspacePayload(rows[0]) });
});

app.post('/api/workspaces/:id/archive', async (req, res) => {
  const workspace = await requireWorkspaceMember(req.params.id, req.user.id, 'admin');
  await getPool().execute('UPDATE workspaces SET archived_at = UTC_TIMESTAMP() WHERE id = ?', [workspace.id]);
  res.json({ message: 'Workspace archived successfully.' });
});

app.delete('/api/workspaces/:id', async (req, res) => {
  const workspace = await requireWorkspaceMember(req.params.id, req.user.id, 'admin');
  if (workspace.role !== 'owner') throw new HttpError(403, 'Only a workspace owner can delete it.');
  await getPool().execute('DELETE FROM workspaces WHERE id = ?', [workspace.id]);
  res.json({ message: 'Workspace deleted successfully.' });
});

app.get('/api/workspaces/:id/members', async (req, res) => {
  await requireWorkspaceMember(req.params.id, req.user.id);
  const [rows] = await getPool().execute(
    `SELECT u.id, u.name, u.email, u.avatar_url, wm.role, wm.created_at
     FROM workspace_members wm JOIN users u ON u.id = wm.user_id
     WHERE wm.workspace_id = ? ORDER BY wm.created_at`,
    [req.params.id],
  );
  res.json({ members: rows.map((row) => ({ ...userPayload(row), role: row.role, joinedAt: row.created_at })) });
});

app.use('/api/projects', requireAuth);
app.use('/api/projects/archived', requireAuth);

app.get('/api/projects/archived', async (req, res) => {
  const workspaceId = req.query.workspaceId;
  const query = `SELECT p.* FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = ? AND p.archived_at IS NOT NULL
    ${workspaceId ? 'AND p.workspace_id = ?' : ''} ORDER BY p.updated_at DESC`;
  const [rows] = await getPool().execute(query, workspaceId ? [req.user.id, workspaceId] : [req.user.id]);
  res.json({ projects: rows.map(projectPayload) });
});

app.get('/api/projects', async (req, res) => {
  const workspaceId = req.query.workspaceId;
  const query = `SELECT p.* FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = ? AND p.archived_at IS NULL
    ${workspaceId ? 'AND p.workspace_id = ?' : ''} ORDER BY p.updated_at DESC`;
  const [rows] = await getPool().execute(query, workspaceId ? [req.user.id, workspaceId] : [req.user.id]);
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
  await getPool().execute(
    `INSERT INTO projects (id, workspace_id, created_by, name, description, status, priority, start_date, due_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, workspaceId, req.user.id, name, req.body.description || null, status, priority, req.body.startDate || null, req.body.dueDate || null],
  );
  const [rows] = await getPool().execute('SELECT * FROM projects WHERE id = ?', [id]);
  res.status(201).json({ project: projectPayload(rows[0]), message: 'Project created successfully.' });
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
  const updates = [];
  const values = [];
  for (const [key, [column, validate]] of Object.entries(fields)) {
    if (Object.hasOwn(req.body || {}, key)) {
      updates.push(`${column} = ?`);
      values.push(validate(req.body[key]));
    }
  }
  if (updates.length === 0) throw new HttpError(400, 'No valid project changes were provided.');
  await getPool().execute(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, [...values, project.id]);
  const [rows] = await getPool().execute('SELECT * FROM projects WHERE id = ?', [project.id]);
  res.json({ project: projectPayload(rows[0]), message: 'Project updated successfully.' });
});

app.post('/api/projects/:id/archive', async (req, res) => {
  const project = await requireProjectMember(req.params.id, req.user.id);
  await getPool().execute('UPDATE projects SET archived_at = UTC_TIMESTAMP() WHERE id = ?', [project.id]);
  res.json({ message: 'Project archived successfully.' });
});

app.post('/api/projects/:id/restore', async (req, res) => {
  const project = await requireProjectMember(req.params.id, req.user.id);
  await getPool().execute('UPDATE projects SET archived_at = NULL WHERE id = ?', [project.id]);
  res.json({ message: 'Project restored successfully.' });
});

app.delete('/api/projects/:id', async (req, res) => {
  const project = await requireProjectMember(req.params.id, req.user.id);
  await getPool().execute('DELETE FROM projects WHERE id = ?', [project.id]);
  res.json({ message: 'Project deleted successfully.' });
});

app.get('/api/tasks', requireAuth, async (req, res) => {
  const { projectId, workspaceId } = req.query;
  let projectClause = '';
  const values = [req.user.id];
  if (projectId) {
    await requireProjectMember(projectId, req.user.id);
    projectClause = ' AND t.project_id = ?';
    values.push(projectId);
  } else if (workspaceId) {
    await requireWorkspaceMember(workspaceId, req.user.id);
    projectClause = ' AND p.workspace_id = ?';
    values.push(workspaceId);
  }
  const [rows] = await getPool().execute(
    `SELECT t.* FROM tasks t
     JOIN projects p ON p.id = t.project_id
     JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
     WHERE wm.user_id = ?${projectClause}
     ORDER BY t.position, t.created_at DESC`,
    values,
  );
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
  await getPool().execute(
    `INSERT INTO tasks (id, project_id, created_by, assigned_to, title, description, status, priority, due_date, position)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, projectId, req.user.id, req.body.assignedTo || null, title, req.body.description || null,
      status, priority, req.body.dueDate || null, Number.isInteger(req.body.position) ? req.body.position : 0,
    ],
  );
  const [rows] = await getPool().execute('SELECT * FROM tasks WHERE id = ?', [id]);
  res.status(201).json({ task: taskPayload(rows[0]), message: 'Task created successfully.' });
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
  const updates = [];
  const values = [];
  for (const [key, [column, validate]] of Object.entries(fields)) {
    if (Object.hasOwn(req.body || {}, key)) {
      updates.push(`${column} = ?`);
      values.push(validate(req.body[key]));
    }
  }
  if (updates.length === 0) throw new HttpError(400, 'No valid task changes were provided.');
  if (Object.hasOwn(req.body, 'status')) {
    updates.push("completed_at = IF(? = 'done', COALESCE(completed_at, UTC_TIMESTAMP()), NULL)");
    values.push(req.body.status);
  }
  if (Object.hasOwn(req.body, 'assignedTo')) {
    await assertProjectAssignee(task.project_id, req.body.assignedTo);
  }
  await getPool().execute(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, [...values, task.id]);
  const [rows] = await getPool().execute('SELECT * FROM tasks WHERE id = ?', [task.id]);
  res.json({ task: taskPayload(rows[0]), message: 'Task updated successfully.' });
});

app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
  const task = await requireTaskMember(req.params.id, req.user.id);
  await getPool().execute('DELETE FROM tasks WHERE id = ?', [task.id]);
  res.json({ message: 'Task deleted successfully.' });
});

app.post('/api/tasks/:id/subtasks', requireAuth, async (req, res) => {
  const task = await requireTaskMember(req.params.id, req.user.id);
  const title = requireText(req.body?.title, 'Subtask title', 200);
  const id = randomUUID();
  await getPool().execute(
    'INSERT INTO subtasks (id, task_id, title, position) VALUES (?, ?, ?, ?)',
    [id, task.id, title, Number.isInteger(req.body.position) ? req.body.position : 0],
  );
  const [rows] = await getPool().execute('SELECT * FROM subtasks WHERE id = ?', [id]);
  res.status(201).json({ subtask: rows[0] });
});

app.patch('/api/tasks/:id/subtasks/:subtaskId', requireAuth, async (req, res) => {
  const task = await requireTaskMember(req.params.id, req.user.id);
  const updates = [];
  const values = [];
  if (Object.hasOwn(req.body || {}, 'title')) {
    updates.push('title = ?');
    values.push(requireText(req.body.title, 'Subtask title', 200));
  }
  if (Object.hasOwn(req.body || {}, 'isCompleted')) {
    if (typeof req.body.isCompleted !== 'boolean') throw new HttpError(400, 'Subtask completion must be true or false.');
    updates.push('is_completed = ?');
    values.push(req.body.isCompleted ? 1 : 0);
  }
  if (updates.length === 0) throw new HttpError(400, 'No valid subtask changes were provided.');
  const [result] = await getPool().execute(
    `UPDATE subtasks SET ${updates.join(', ')} WHERE id = ? AND task_id = ?`,
    [...values, req.params.subtaskId, task.id],
  );
  if (result.affectedRows === 0) throw new HttpError(404, 'Subtask not found.');
  const [rows] = await getPool().execute(
    'SELECT * FROM subtasks WHERE id = ? AND task_id = ?',
    [req.params.subtaskId, task.id],
  );
  res.json({ subtask: rows[0] });
});

app.delete('/api/tasks/:id/subtasks/:subtaskId', requireAuth, async (req, res) => {
  const task = await requireTaskMember(req.params.id, req.user.id);
  const [result] = await getPool().execute(
    'DELETE FROM subtasks WHERE id = ? AND task_id = ?',
    [req.params.subtaskId, task.id],
  );
  if (result.affectedRows === 0) throw new HttpError(404, 'Subtask not found.');
  res.json({ message: 'Subtask deleted successfully.' });
});

app.get('/api/search', requireAuth, async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!query) throw new HttpError(400, 'Search query is required.');
  if (query.length > 120) throw new HttpError(400, 'Search query must be 120 characters or fewer.');
  const term = `%${query}%`;
  const [projects] = await getPool().execute(
    `SELECT p.id, 'Project' AS type, p.name AS title, p.description
     FROM projects p JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
     WHERE wm.user_id = ? AND p.archived_at IS NULL AND (p.name LIKE ? OR p.description LIKE ?)
     LIMIT 20`,
    [req.user.id, term, term],
  );
  const [workspaces] = await getPool().execute(
    `SELECT w.id, 'Workspace' AS type, w.name AS title, w.description
     FROM workspaces w JOIN workspace_members wm ON wm.workspace_id = w.id
     WHERE wm.user_id = ? AND w.archived_at IS NULL AND (w.name LIKE ? OR w.description LIKE ?)
     LIMIT 20`,
    [req.user.id, term, term],
  );
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