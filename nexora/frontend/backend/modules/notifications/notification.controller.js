const service = require('./notification.service');

module.exports = {
  list: async (req, res) => {
    const { items, total } = await service.list(req.user.id, req.query);
    res.json({ notifications: items, total });
  },
  unreadCount: async (req, res) => {
    res.json({ count: await service.unreadCount(req.user.id) });
  },
  markRead: async (req, res) => {
    await service.markRead(req.user.id, req.params.id);
    res.json({ message: 'Notification marked as read.' });
  },
  markAllRead: async (req, res) => {
    const count = await service.markAllRead(req.user.id);
    res.json({ message: 'Notifications marked as read.', updated: count });
  },
  remove: async (req, res) => {
    await service.remove(req.user.id, req.params.id);
    res.json({ message: 'Notification deleted successfully.' });
  },
};