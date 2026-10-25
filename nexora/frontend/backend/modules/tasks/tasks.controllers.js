const { createResourceController } = require('../../utils/resourceModule');
const service = require('./tasks.service');
module.exports = createResourceController(service, service);