const { createResourceController } = require('../../utils/resourceModule');
const service = require('./comments.service');
module.exports = createResourceController(service, service);