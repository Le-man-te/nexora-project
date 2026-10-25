const repository = require('./settings.repository');
const { hashPassword, verifyPassword, validatePassword } = require('../../security/password');
const ApiError = require('../../utils/ApiErroir');

function validateProfile(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw ApiError.badRequest('Profile must be an object.');
  const values = {};
  if (Object.hasOwn(input, 'name')) {
    if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 120) {
      throw ApiError.badRequest('Name must be between 1 and 120 characters.');
    }
    values.name = input.name.trim();
  }
  if (Object.hasOwn(input, 'avatarUrl')) {
    if (input.avatarUrl !== null && (typeof input.avatarUrl !== 'string' || input.avatarUrl.length > 2048)) {
      throw ApiError.badRequest('Avatar URL is invalid.');
    }
    if (input.avatarUrl !== null) {
      let avatarUrl;
      try {
        avatarUrl = new URL(input.avatarUrl);
      } catch {
        throw ApiError.badRequest('Avatar URL is invalid.');
      }
      if (!['http:', 'https:'].includes(avatarUrl.protocol)) throw ApiError.badRequest('Avatar URL is invalid.');
    }
    values.avatarUrl = input.avatarUrl;
  }
  if (!Object.keys(values).length) throw ApiError.badRequest('No profile changes were provided.');
  return values;
}

function validatePreferences(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw ApiError.badRequest('Settings must be an object.');
  if (JSON.stringify(input).length > 10000) throw ApiError.badRequest('Settings payload is too large.');
  return input;
}

async function changePassword(userId, sessionId, currentPassword, newPassword) {
  if (typeof sessionId !== 'string' || !sessionId) throw ApiError.unauthorized('Current session is unavailable.');
  if (typeof currentPassword !== 'string') throw ApiError.badRequest('Current password is required.');
  const validation = validatePassword(newPassword);
  if (!validation.isValid) throw ApiError.badRequest(validation.message);
  const stored = await repository.getPasswordHash(userId);
  if (!stored || !(await verifyPassword(currentPassword, stored))) {
    throw ApiError.badRequest('Current password is incorrect.');
  }
  await repository.changePassword(userId, sessionId, await hashPassword(newPassword));
}

module.exports = {
  getProfile: async (userId) => {
    const profile = await repository.getProfile(userId);
    if (!profile) throw ApiError.notFound('User not found.');
    return profile;
  },
  updateProfile: async (userId, input) => repository.updateProfile(userId, validateProfile(input)),
  getNotifications: (userId) => repository.getPreferences(userId).then((value) => value.notifications || {}),
  updateNotifications: async (userId, input) => {
    const preferences = validatePreferences(input);
    return repository.updatePreferences(userId, { notifications: preferences });
  },
  getAppearance: (userId) => repository.getPreferences(userId).then((value) => value.appearance || {}),
  updateAppearance: async (userId, input) => {
    const preferences = validatePreferences(input);
    return repository.updatePreferences(userId, { appearance: preferences });
  },
  changePassword,
  listSessions: (userId) => repository.listSessions(userId),
  revokeSession: async (userId, id) => {
    if (!(await repository.revokeSession(userId, id))) throw ApiError.notFound('Session not found.');
  },
};