const service = require('./tasks.service');

function validateTask(value, mode = 'create') {
  try {
    service.validate(value, mode);
    return { isValid: true, errors: {} };
  } catch (error) {
    return { isValid: false, errors: { form: error.message } };
  }
}

module.exports = { validateTask, validateCreateTask: (value) => validateTask(value, 'create') };