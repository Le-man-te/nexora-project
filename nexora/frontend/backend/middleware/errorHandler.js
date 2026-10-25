const ApiError = require('../utils/ApiErroir');
const logger = require('../config/logger');
const env = require('../config/env');

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  const status = Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
    ? error.status
    : 500;
  if (status >= 500) {
    logger.error('Unhandled request error.', {
      method: req.method,
      path: req.path,
      message: error.message,
    });
  }

  const response = {
    message: status >= 500 && env.nodeEnv === 'production'
      ? 'Internal server error.'
      : error.message || 'Internal server error.',
  };
  if (error instanceof ApiError) response.code = error.code;
  if (error.details !== undefined && status < 500) response.details = error.details;
  if (env.nodeEnv !== 'production' && status >= 500) response.details = error.stack;
  res.status(status).json(response);
}

module.exports = errorHandler;