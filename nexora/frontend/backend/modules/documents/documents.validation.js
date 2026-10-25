const service = require('./documents.service');

function validateDocument(value, mode = 'create') {
  try {
    service.validate(value, mode);
    return { isValid: true, errors: {} };
  } catch (error) {
    return { isValid: false, errors: { form: error.message } };
  }
}

module.exports = { validateDocument, validateCreateDocument: (value) => validateDocument(value, 'create') };