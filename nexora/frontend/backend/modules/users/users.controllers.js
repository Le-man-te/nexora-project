const service = require('./users.services');
const { validateProfile } = require('./users.validations ');
const ApiError = require('../../utils/ApiErroir');

function profilePayload(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatar_url || null,
    createdAt: user.created_at,
  };
}

async function getProfile(req, res) {
  res.json({ user: profilePayload(await service.get(req.user.id, req.user.id)) });
}

async function updateProfile(req, res) {
  const validation = validateProfile(req.body);
  if (!validation.isValid) throw ApiError.badRequest('Profile changes are invalid.', validation.errors);
  res.json({ user: profilePayload(await service.update(req.user.id, req.user.id, req.body)) });
}

module.exports = { getProfile, updateProfile };