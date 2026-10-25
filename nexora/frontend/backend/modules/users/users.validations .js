const service = require('./users.services');

function validateProfile(value) {
  try {
    service.validate(value, 'update');
    return { isValid: true, errors: {} };
  } catch (error) {
    return { isValid: false, errors: { form: error.message } };
  }
}

module.exports = { validateProfile };