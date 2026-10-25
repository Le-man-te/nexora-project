const repository = require('./notification.repository');
const { parsePagination } = require('../../utils/pagination');
const ApiError = require('../../utils/ApiErroir');

module.exports = {
  list: (userId, query) => repository.list(userId, parsePagination(query)),
  unreadCount: (userId) => repository.unreadCount(userId),
  markRead: async (userId, id) => {
    if (!(await repository.markRead(userId, id))) throw ApiError.notFound('Notification not found.');
  },
  markAllRead: (userId) => repository.markAllRead(userId),
  remove: async (userId, id) => {
    if (!(await repository.remove(userId, id))) throw ApiError.notFound('Notification not found.');
  },
};