const { createResourceService } = require('../../utils/resourceModule');
const repository = require('./documents.repository');
module.exports = createResourceService(repository, repository);