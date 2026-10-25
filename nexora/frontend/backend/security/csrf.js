const ApiError = require('../utils/ApiErroir');
const env = require('../config/env');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const ALLOWED_ORIGINS = new Set(
  (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

function csrfProtection(req, _res, next) {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }
  const cookieHeader = req.headers.cookie || '';
  const hasSessionCookie = cookieHeader
    .split(';')
    .some((pair) => pair.trim().startsWith(`${env.sessionCookieName}=`));
  if (!hasSessionCookie) {
    next();
    return;
  }
  const origin = req.get('origin');
  const sameOrigin = `${req.protocol}://${req.get('host')}`;
  if (!origin || (origin !== sameOrigin && !ALLOWED_ORIGINS.has(origin))) {
    next(ApiError.forbidden('Request origin could not be verified.'));
    return;
  }
  next();
}

module.exports = csrfProtection;