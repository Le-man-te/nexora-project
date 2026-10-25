const { createResourceService } = require('../../utils/resourceModule');
const repository = require('./tasks.repository');
module.exports = createResourceService(repository, repository);