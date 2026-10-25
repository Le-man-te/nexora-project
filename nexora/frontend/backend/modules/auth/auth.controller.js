const service = require('./auth.service');
const { validateEmail, validateResetPassword } = require('./auth.validation');
const ApiError = require('../../utils/ApiErroir');

async function forgotPassword(req, res) {
  const result = validateEmail(req.body);
  if (!result.isValid) {
    res.status(400).json({ message: 'Enter a valid email address.', errors: result.errors });
    return;
  }
  await service.requestPasswordReset(result.value.email);
  res.json({ message: 'If an account exists for that email, a reset link will be sent.' });
}

async function resetPassword(req, res) {
  const result = validateResetPassword(req.body);
  if (!result.isValid) {
    res.status(400).json({ message: 'Reset details are invalid.', errors: result.errors });
    return;
  }
  await service.resetPassword(result.value.token, result.value.password);
  res.json({ message: 'Password reset successfully.' });
}

async function verifyEmail() {
  throw new ApiError(501, 'Email verification is not configured.', 'FEATURE_UNAVAILABLE');
}

module.exports = { forgotPassword, resetPassword, verifyEmail };