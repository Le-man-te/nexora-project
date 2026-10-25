const service = require('./admin.service');

async function summary(req, res) {
  res.json({ summary: await service.getWorkspaceSummary(req.user.id, req.query.workspaceId) });
}

module.exports = { summary };