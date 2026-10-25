function asyncHandler(handler) {
  if (typeof handler !== 'function') {
    throw new TypeError('asyncHandler expects a route handler function.');
  }
  return function wrappedHandler(req, res, next) {
    return Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
module.exports.asyncHandler = asyncHandler;