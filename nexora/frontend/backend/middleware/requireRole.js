const ApiError = require('../utils/ApiErroir');

const ROLE_RANK = Object.freeze({ member: 1, admin: 2, owner: 3 });

function requireRole(minimumRole) {
  if (!Object.hasOwn(ROLE_RANK, minimumRole)) {
    throw new TypeError(`Unknown role: ${minimumRole}`);
  }
  return function roleGuard(req, _res, next) {
    if (!req.user) {
      next(ApiError.unauthorized());
      return;
    }
    if (!Object.hasOwn(ROLE_RANK, req.user.role) || ROLE_RANK[req.user.role] < ROLE_RANK[minimumRole]) {
      next(ApiError.forbidden());
      return;
    }
    next();
  };
}

module.exports = requireRole;