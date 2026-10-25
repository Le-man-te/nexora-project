const service = require('./ai.service');

module.exports = {
  chat: async (req, res) => res.json(await service.chat(req.user.id, req.body)),
  list: async (req, res) => res.json({ conversations: await service.listConversations(req.user.id) }),
  get: async (req, res) => res.json({ conversation: await service.getConversation(req.user.id, req.params.id) }),
  remove: async (req, res) => {
    await service.deleteConversation(req.user.id, req.params.id);
    res.json({ message: 'Conversation deleted successfully.' });
  },
};