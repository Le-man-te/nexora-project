const service = require('./projects.services');

function validateProject(value, mode = 'create') {
  try {
    service.validate(value, mode);
    return { isValid: true, errors: {} };
  } catch (error) {
    return { isValid: false, errors: { form: error.message } };
  }
}

module.exports = { validateProject, validateCreateProject: (value) => validateProject(value, 'create') };