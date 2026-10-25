const service = require('./notes.service');

function validateNote(value, mode = 'create') {
  try {
    service.validate(value, mode);
    return { isValid: true, errors: {} };
  } catch (error) {
    return { isValid: false, errors: { form: error.message } };
  }
}

module.exports = { validateNote, validateCreateNote: (value) => validateNote(value, 'create') };