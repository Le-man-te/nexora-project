const { createResourceRepository } = require('../../utils/resourceModule');
module.exports = createResourceRepository(require('../resourceDefinitions').tasks);