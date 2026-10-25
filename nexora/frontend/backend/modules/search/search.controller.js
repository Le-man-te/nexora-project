const service = require('./search.service');

async function search(req, res) {
  res.json(await service.search(req.user.id, req.query));
}

module.exports = { search };