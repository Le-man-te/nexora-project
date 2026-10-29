const ApiError = require('../utils/ApiErroir');

function requirePlatformAdmin(req, _res, next) {
  if (!req.user) {
    next(ApiError.unauthorized());
    return;
  }
  if (req.user.global_role !== 'platform_admin') {
    next(ApiError.forbidden('Platform administrator permission is required.'));
    return;
  }
  next();
}

module.exports = requirePlatformAdmin;
