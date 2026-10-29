const repository = require('./ai.repository');
const provider = require('./aiprovider');
const { validateChat } = require('./ai.validation');
const { getMongoDatabase } = require('../../database/mongo');
const ApiError = require('../../utils/ApiErroir');
const { randomUUID } = require('node:crypto');

async function assertWorkspaceMember(userId, workspaceId) {
  if (!workspaceId) return;
  const membership = await getMongoDatabase().collection('workspace_members').findOne({
    workspace_id: workspaceId,
    user_id: userId,
  });
  if (!membership) throw ApiError.notFound('Workspace not found.');
}

async function chat(userId, input) {
  const validation = validateChat(input);
  if (!validation.isValid) throw ApiError.badRequest('Chat request is invalid.', validation.errors);
  const { message, conversationId, workspaceId } = validation.value;
  await assertWorkspaceMember(userId, workspaceId);

  let conversation = await repository.getConversation(userId, conversationId);
  if (!conversation) {
    if (input.conversationId) throw ApiError.notFound('Conversation not found.');
    const id = conversationId || randomUUID();
    await repository.createConversation(userId, id, workspaceId, message);
    conversation = await repository.getConversation(userId, id);
  }

  const prior = await repository.getMessages(userId, conversation.id);
  const history = prior.slice(-20).map(({ role, content }) => ({ role, content }));
  const answer = await provider.completeChat([...history, { role: 'user', content: message }]);
  await repository.addExchange(userId, conversation.id, message, answer);
  return { conversationId: conversation.id, message: answer };
}

async function getConversation(userId, id) {
  const conversation = await repository.getConversation(userId, id);
  if (!conversation) throw ApiError.notFound('Conversation not found.');
  return { ...conversation, messages: await repository.getMessages(userId, id) };
}

async function deleteConversation(userId, id) {
  if (!(await repository.deleteConversation(userId, id))) throw ApiError.notFound('Conversation not found.');
}

module.exports = {
  chat,
  listConversations: (userId) => repository.listConversations(userId),
  getConversation,
  deleteConversation,
};