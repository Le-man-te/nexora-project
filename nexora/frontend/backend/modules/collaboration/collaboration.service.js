const { randomUUID, createHash } = require('node:crypto');
const { getMongoDatabase } = require('../../database/mongo');
const { sendEmail } = require('../../services/emailSerrvice');
const ApiError = require('../../utils/ApiErroir');
const { parsePagination } = require('../../utils/pagination');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const hashToken = (token) => createHash('sha256').update(token).digest('hex');

async function assertAdmin(userId, workspaceId, database = getMongoDatabase()) {
  const membership = await database.collection('workspace_members').findOne({
    workspace_id: workspaceId,
    user_id: userId,
  });
  if (!membership) throw ApiError.notFound('Workspace not found.');
  if (!['owner', 'admin'].includes(membership.role)) throw ApiError.forbidden('Workspace administrator permission is required.');
}

async function getInvitation(userId, invitationId, database = getMongoDatabase()) {
  const invitation = await database.collection('workspace_invitations').findOne({ id: invitationId });
  if (!invitation) return null;
  const membership = await database.collection('workspace_members').findOne({
    workspace_id: invitation.workspace_id,
    user_id: userId,
  });
  return membership ? invitation : null;
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
  return getMongoDatabase().collection('workspace_invitations')
    .find({ workspace_id: workspaceId })
    .project({ _id: 0, id: 1, workspace_id: 1, email: 1, role: 1, status: 1, expires_at: 1, created_at: 1 })
    .sort({ created_at: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();
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
  const now = new Date();
  await getMongoDatabase().collection('workspace_invitations').insertOne({
    id,
    workspace_id: workspaceId,
    invited_by: userId,
    email,
    role,
    token_hash: hashToken(id),
    status: 'pending',
    expires_at: expiresAt,
    accepted_at: null,
    created_at: now,
    updated_at: now,
  });
  try {
    await sendInvite(email, id);
  } catch (error) {
    await getMongoDatabase().collection('workspace_invitations').updateOne(
      { id },
      { $set: { status: 'revoked', updated_at: new Date() } },
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
  await getMongoDatabase().collection('workspace_invitations').updateOne(
    { id, status: 'pending' },
    { $set: { expires_at: expiresAt, updated_at: new Date() } },
  );
  try {
    await sendInvite(invitation.email, id);
  } catch (error) {
    await getMongoDatabase().collection('workspace_invitations').updateOne(
      { id },
      { $set: { status: 'revoked', updated_at: new Date() } },
    );
    throw error;
  }
}

async function revokeInvitation(userId, id) {
  const invitation = await getInvitation(userId, id);
  if (!invitation) throw ApiError.notFound('Invitation not found.');
  await assertAdmin(userId, invitation.workspace_id);
  const result = await getMongoDatabase().collection('workspace_invitations').updateOne(
    { id, status: 'pending' },
    { $set: { status: 'revoked', updated_at: new Date() } },
  );
  if (!result.matchedCount) throw ApiError.badRequest('Only pending invitations can be revoked.');
}

async function respondToInvitation(user, id, accept) {
  const database = getMongoDatabase();
  const now = new Date();
  const invitation = await database.collection('workspace_invitations').findOneAndUpdate(
    {
      id,
      token_hash: hashToken(id),
      email: user.email,
      status: 'pending',
      expires_at: { $gt: now },
    },
    { $set: { status: accept ? 'accepted' : 'revoked', accepted_at: accept ? now : null, updated_at: now } },
    { returnDocument: 'before' },
  );
  if (!invitation) throw ApiError.notFound('Invitation not found or expired.');
  if (!accept) return;

  try {
    await database.collection('workspace_members').updateOne(
      { workspace_id: invitation.workspace_id, user_id: user.id },
      {
        $setOnInsert: {
          id: randomUUID(),
          workspace_id: invitation.workspace_id,
          user_id: user.id,
          role: invitation.role,
          created_at: now,
        },
      },
      { upsert: true },
    );
  } catch (error) {
    await database.collection('workspace_invitations').updateOne(
      { id, status: 'accepted' },
      { $set: { status: 'pending', accepted_at: null, updated_at: new Date() } },
    );
    throw error;
  }
}

module.exports = {
  listInvitations,
  createInvitation,
  resendInvitation,
  revokeInvitation,
  respondToInvitation,
};
