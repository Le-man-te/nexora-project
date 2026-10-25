const ApiError = require('../utils/ApiErroir');

function createRateLimit({
  windowMs = 15 * 60 * 1000,
  max = 100,
  keyGenerator = (req) => req.ip || req.socket.remoteAddress || 'unknown',
  message = 'Too many requests. Please try again later.',
} = {}) {
  if (!Number.isSafeInteger(windowMs) || windowMs < 1000) throw new TypeError('windowMs must be at least 1000.');
  if (!Number.isSafeInteger(max) || max < 1) throw new TypeError('max must be a positive integer.');

  const clients = new Map();
  let lastCleanup = 0;

  return function rateLimit(req, res, next) {
    const now = Date.now();
    if (now - lastCleanup >= windowMs) {
      for (const [key, state] of clients) {
        if (state.resetAt <= now) clients.delete(key);
      }
      lastCleanup = now;
    }

    const key = String(keyGenerator(req));
    if (!clients.has(key) && clients.size >= 10000) {
      next(new ApiError(503, 'Rate limiter capacity reached.', 'RATE_LIMIT_UNAVAILABLE'));
      return;
    }
    let state = clients.get(key);
    if (!state || state.resetAt <= now) {
      state = { count: 0, resetAt: now + windowMs };
      clients.set(key, state);
    }
    state.count += 1;

    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - state.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(state.resetAt / 1000)));
    if (state.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((state.resetAt - now) / 1000)));
      next(new ApiError(429, message, 'RATE_LIMITED'));
      return;
    }
    next();
  };
}

module.exports = createRateLimit;
module.exports.createRateLimit = createRateLimit;