const service = require('./settings.service');
const ApiError = require('../../utils/ApiErroir');

module.exports = {
  getProfile: async (req, res) => res.json({ profile: await service.getProfile(req.user.id) }),
  updateProfile: async (req, res) => {
    if (req.is('multipart/form-data')) throw new ApiError(415, 'Avatar upload is not enabled on this server.', 'UPLOAD_UNAVAILABLE');
    res.json({ profile: await service.updateProfile(req.user.id, req.body) });
  },
  getNotifications: async (req, res) => res.json({ preferences: await service.getNotifications(req.user.id) }),
  updateNotifications: async (req, res) => res.json({ preferences: await service.updateNotifications(req.user.id, req.body) }),
  getAppearance: async (req, res) => res.json({ preferences: await service.getAppearance(req.user.id) }),
  updateAppearance: async (req, res) => res.json({ preferences: await service.updateAppearance(req.user.id, req.body) }),
  updatePassword: async (req, res) => {
    await service.changePassword(req.user.id, req.user.session_id, req.body.currentPassword, req.body.newPassword);
    res.json({ message: 'Password updated successfully.' });
  },
  updateTwoFactor: async (_req, _res) => {
    throw new ApiError(501, 'Two-factor authentication is not configured.', 'FEATURE_UNAVAILABLE');
  },
  listSessions: async (req, res) => {
    const sessions = await service.listSessions(req.user.id);
    res.json({ sessions: sessions.map((session) => ({ ...session, current: session.id === req.user.session_id })) });
  },
  revokeSession: async (req, res) => {
    await service.revokeSession(req.user.id, req.params.id);
    res.json({ message: 'Session revoked successfully.' });
  },
};