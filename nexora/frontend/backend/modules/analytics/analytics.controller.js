const service = require('./analytics.service');

module.exports = {
  overview: async (req, res) => res.json({ overview: await service.overview(req.user.id, req.query) }),
  trends: async (req, res) => res.json({ trends: await service.trends(req.user.id, req.query) }),
  projects: async (req, res) => res.json({ projects: await service.projects(req.user.id, req.query) }),
  team: async (req, res) => res.json({ team: await service.team(req.user.id, req.query) }),
};