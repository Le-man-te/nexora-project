const service = require('./workspaces.services');

module.exports = {
  list: async (req, res) => res.json({ workspaces: await service.list(req.user.id) }),
  get: async (req, res) => res.json({ workspace: await service.get(req.user.id, req.params.id) }),
  create: async (req, res) => res.status(201).json({ workspace: await service.create(req.user.id, req.body) }),
  update: async (req, res) => res.json({ workspace: await service.update(req.user.id, req.params.id, req.body) }),
  archive: async (req, res) => {
    await service.archive(req.user.id, req.params.id);
    res.json({ message: 'Workspace archived successfully.' });
  },
  restore: async (req, res) => {
    await service.restore(req.user.id, req.params.id);
    res.json({ message: 'Workspace restored successfully.' });
  },
  remove: async (req, res) => {
    await service.remove(req.user.id, req.params.id);
    res.json({ message: 'Workspace deleted successfully.' });
  },
  members: async (req, res) => res.json({ members: await service.members(req.user.id, req.params.id) }),
};