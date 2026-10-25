const { randomUUID, createHash } = require('node:crypto');
const { getPool } = require('../../database/pools');
const { withTransaction } = require('../../database/transaction');
const { sendEmail } = require('../../services/emailSerrvice');
const ApiError = require('../../utils/ApiErroir');
const { parsePagination } = require('../../utils/pagination');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

async function assertAdmin(userId, workspaceId, pool = getPool()) {
  const [rows] = await pool.execute(
    'SELECT role FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1',
    [workspaceId, userId],
  );
  if (!rows.length) throw ApiError.notFound('Workspace not found.');
  if (!['owner', 'admin'].includes(rows[0].role)) throw ApiError.forbidden('Workspace administrator permission is required.');
}

async function getInvitation(userId, invitationId, pool = getPool()) {
  const [rows] = await pool.execute(
    `SELECT i.* FROM workspace_invitations i
     JOIN workspace_members wm ON wm.workspace_id = i.workspace_id
     WHERE i.id = ? AND wm.user_id = ? LIMIT 1`,
    [invitationId, userId],
  );
  return rows[0] || null;
}

async function sendInvite(email, invitationId) {
  const baseUrl = process.env.APP_BASE_URL;
  if (!baseUrl) throw new Error('APP_BASE_URL must be configured to send invitations.');
  const url = new URL('/invite', baseUrl);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('APP_BASE_URL must use HTTP or HTTPS.');
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('APP_BASE_URL must use HTTPS in production.');
  }
  url.searchParams.set('invitation', invitationId);
  await sendEmail({
    to: email,
    subject: 'You have been invited to Nexora',
    text: `Accept your Nexora workspace invitation: ${url.toString()}`,
  });
}

async function listInvitations(userId, query = {}) {
  const workspaceId = typeof query.workspaceId === 'string' ? query.workspaceId : '';
  if (!workspaceId) throw ApiError.badRequest('Workspace id is required.');
  await assertAdmin(userId, workspaceId);
  const { limit, offset } = parsePagination(query);
  const [rows] = await getPool().execute(
    `SELECT id, workspace_id, email, role, status, expires_at, created_at
     FROM workspace_invitations WHERE workspace_id = ?
     ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [workspaceId, limit, offset],
  );
  return rows;
}

async function createInvitation(userId, input) {
  const workspaceId = input?.workspaceId;
  const email = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';
  const requestedRole = input?.role;
  const role = requestedRole === 'Admin' ? 'admin' : requestedRole === 'Member' ? 'member' : '';
  if (typeof workspaceId !== 'string' || !/^[0-9a-f-]{36}$/i.test(workspaceId)) {
    throw ApiError.badRequest('Workspace id is invalid.');
  }
  if (!EMAIL_PATTERN.test(email)) throw ApiError.badRequest('Enter a valid email address.');
  if (!role) throw ApiError.badRequest('Invitation role must be Admin or Member.');
  await assertAdmin(userId, workspaceId);

  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await getPool().execute(
    `INSERT INTO workspace_invitations
       (id, workspace_id, invited_by, email, role, token_hash, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, workspaceId, userId, email, role, hashToken(id), expiresAt],
  );
  try {
    await sendInvite(email, id);
  } catch (error) {
    await getPool().execute(
      "UPDATE workspace_invitations SET status = 'revoked' WHERE id = ?",
      [id],
    );
    throw error;
  }
  return { id, workspaceId, email, role, status: 'pending', expiresAt };
}

async function resendInvitation(userId, id) {
  const invitation = await getInvitation(userId, id);
  if (!invitation) throw ApiError.notFound('Invitation not found.');
  await assertAdmin(userId, invitation.workspace_id);
  if (invitation.status !== 'pending') throw ApiError.badRequest('Only pending invitations can be resent.');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await getPool().execute(
    'UPDATE workspace_invitations SET expires_at = ? WHERE id = ? AND status = ?',
    [expiresAt, id, 'pending'],
  );
  try {
    await sendInvite(invitation.email, id);
  } catch (error) {
    await getPool().execute("UPDATE workspace_invitations SET status = 'revoked' WHERE id = ?", [id]);
    throw error;
  }
}

async function revokeInvitation(userId, id) {
  const invitation = await getInvitation(userId, id);
  if (!invitation) throw ApiError.notFound('Invitation not found.');
  await assertAdmin(userId, invitation.workspace_id);
  const [result] = await getPool().execute(
    "UPDATE workspace_invitations SET status = 'revoked' WHERE id = ? AND status = 'pending'",
    [id],
  );
  if (!result.affectedRows) throw ApiError.badRequest('Only pending invitations can be revoked.');
}

async function respondToInvitation(user, id, accept) {
  return withTransaction(getPool(), async (connection) => {
    const [rows] = await connection.execute(
      `SELECT * FROM workspace_invitations
       WHERE id = ? AND token_hash = ? AND email = ? AND status = 'pending' AND expires_at > UTC_TIMESTAMP()
       FOR UPDATE`,
      [id, hashToken(id), user.email],
    );
    if (!rows.length) throw ApiError.notFound('Invitation not found or expired.');
    const invitation = rows[0];
    if (accept) {
      const [memberships] = await connection.execute(
        'SELECT id FROM workspace_members WHERE workspace_id = ? AND user_id = ? LIMIT 1',
        [invitation.workspace_id, user.id],
      );
      if (memberships.length === 0) {
        await connection.execute(
          `INSERT INTO workspace_members (id, workspace_id, user_id, role)
           VALUES (?, ?, ?, ?)`,
          [randomUUID(), invitation.workspace_id, user.id, invitation.role],
        );
      }
      await connection.execute(
        "UPDATE workspace_invitations SET status = 'accepted', accepted_at = UTC_TIMESTAMP() WHERE id = ?",
        [id],
      );
    } else {
      await connection.execute(
        "UPDATE workspace_invitations SET status = 'revoked' WHERE id = ?",
        [id],
      );
    }
  });
}

module.exports = {
  listInvitations,
  createInvitation,
  resendInvitation,
  revokeInvitation,
  respondToInvitation,
};
