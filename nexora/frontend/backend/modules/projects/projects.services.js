const { createResourceService } = require('../../utils/resourceModule');
const repository = require('./projects.repository');
module.exports = createResourceService(repository, repository);