const { createResourceService } = require('../../utils/resourceModule');
const repository = require('./notes.repository');
module.exports = createResourceService(repository, repository);