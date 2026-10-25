const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value) {
  const email = typeof value?.email === 'string' ? value.email.trim().toLowerCase() : '';
  const errors = EMAIL_PATTERN.test(email) ? {} : { email: 'Enter a valid email address.' };
  return { isValid: Object.keys(errors).length === 0, errors, value: { email } };
}

function validateResetPassword(value) {
  const token = typeof value?.token === 'string' ? value.token : '';
  const password = value?.password;
  const errors = {};
  if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) errors.token = 'Reset token is invalid.';
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    errors.password = 'Password must be between 8 and 128 characters.';
  }
  return { isValid: Object.keys(errors).length === 0, errors, value: { token, password } };
}

module.exports = { validateEmail, validateResetPassword };