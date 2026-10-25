const service = require('./workspaces.services');

function validateWorkspace(value, partial = false) {
  try {
    service.validate(value, partial);
    return { isValid: true, errors: {} };
  } catch (error) {
    return { isValid: false, errors: { form: error.message } };
  }
}

module.exports = { validateWorkspace };