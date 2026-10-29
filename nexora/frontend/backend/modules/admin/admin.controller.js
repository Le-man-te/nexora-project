const service = require('./admin.service');

async function summary(req, res) {
  res.json({ summary: await service.getWorkspaceSummary(req.user.id, req.query.workspaceId) });
}

async function overview(_req, res) {
  res.json(await service.getPlatformOverview());
}

async function setUserStatus(req, res) {
  const result = await service.setUserDisabled(req.user.id, req.params.userId, req.body?.disabled);
  res.json({ user: result });
}

async function setWorkspaceStatus(req, res) {
  const result = await service.setWorkspaceArchived(req.params.workspaceId, req.body?.archived);
  res.json({ workspace: result });
}

module.exports = { summary, overview, setUserStatus, setWorkspaceStatus };