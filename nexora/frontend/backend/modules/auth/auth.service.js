const { createHash, randomBytes } = require('node:crypto');
const repository = require('./auth.repository');
const { hashPassword } = require('../../security/password');
const { sendEmail } = require('../../services/emailSerrvice');
const ApiError = require('../../utils/ApiErroir');

const RESET_TTL_MS = 30 * 60 * 1000;
const digest = (token) => createHash('sha256').update(token).digest('hex');

async function requestPasswordReset(email) {
  if (!process.env.APP_BASE_URL || !process.env.EMAIL_API_URL || !process.env.EMAIL_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error('Password reset email delivery is not configured.');
  }
  const user = await repository.findUserByEmail(email);
  if (!user) return;
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + RESET_TTL_MS);
  await repository.createResetToken(user.id, digest(token), expiresAt);
  const baseUrl = process.env.APP_BASE_URL;
  if (!baseUrl) throw new Error('APP_BASE_URL must be configured to send password reset links.');
  const parsedBaseUrl = new URL(baseUrl);
  if (!['http:', 'https:'].includes(parsedBaseUrl.protocol)) {
    throw new Error('APP_BASE_URL must use HTTP or HTTPS.');
  }
  if (process.env.NODE_ENV === 'production' && parsedBaseUrl.protocol !== 'https:') {
    throw new Error('APP_BASE_URL must use HTTPS in production.');
  }
  const resetUrl = new URL('/reset-password', parsedBaseUrl);
  resetUrl.searchParams.set('token', token);
  await sendEmail({
    to: user.email,
    subject: 'Reset your Nexora password',
    text: `Use this link within 30 minutes to reset your password: ${resetUrl.toString()}`,
  });
}

async function resetPassword(token, password) {
  const updated = await repository.resetPassword(digest(token), await hashPassword(password));
  if (!updated) throw ApiError.badRequest('This password reset link is invalid or has expired.');
}

module.exports = { requestPasswordReset, resetPassword };