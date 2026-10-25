const ApiError = require('../utils/ApiErroir');

function validateRequest(validator, source = 'body') {
  if (!['body', 'query', 'params'].includes(source)) {
    throw new TypeError('Validation source must be body, query, or params.');
  }
  if (typeof validator !== 'function') throw new TypeError('A validation function is required.');

  return function validate(req, _res, next) {
    try {
      const result = validator(req[source] || {});
      if (!result || result.isValid !== true) {
        next(ApiError.badRequest('Request validation failed.', result?.errors || {}));
        return;
      }
      if (result.value !== undefined) req[source] = result.value;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = validateRequest;