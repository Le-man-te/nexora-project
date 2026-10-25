function validateChat(value) {
  const errors = {};
  const message = typeof value?.message === 'string' ? value.message.trim() : '';
  if (!message) errors.message = 'A message is required.';
  if (message.length > 8000) errors.message = 'Message must be 8000 characters or fewer.';
  const conversationId = value?.conversationId;
  if (conversationId !== undefined && (typeof conversationId !== 'string' || !/^[0-9a-f-]{36}$/i.test(conversationId))) {
    errors.conversationId = 'Conversation id is invalid.';
  }
  const workspaceId = value?.workspaceId;
  if (workspaceId !== undefined && (typeof workspaceId !== 'string' || !/^[0-9a-f-]{36}$/i.test(workspaceId))) {
    errors.workspaceId = 'Workspace id is invalid.';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    value: {
      message,
      conversationId: conversationId || null,
      workspaceId: workspaceId || null,
    },
  };
}

module.exports = { validateChat };