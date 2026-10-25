const { createResourceController } = require('../../utils/resourceModule');
const service = require('./notes.service');
module.exports = createResourceController(service, service);