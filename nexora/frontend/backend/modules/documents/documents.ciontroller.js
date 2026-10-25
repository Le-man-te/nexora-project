const { createResourceController } = require('../../utils/resourceModule');
const service = require('./documents.service');
module.exports = createResourceController(service, service);