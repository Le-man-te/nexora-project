const { createResourceService } = require('../../utils/resourceModule');
const repository = require('./users.repository');
module.exports = createResourceService(repository, repository);