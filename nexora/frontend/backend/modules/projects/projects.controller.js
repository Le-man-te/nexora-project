const { createResourceController } = require('../../utils/resourceModule');
const service = require('./projects.services');
module.exports = createResourceController(service, service);