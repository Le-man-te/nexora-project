const { createResourceService } = require('../../utils/resourceModule');
const repository = require('./commets.repository');
module.exports = createResourceService(repository, repository);