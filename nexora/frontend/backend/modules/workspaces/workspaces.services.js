const repository = require('./workspaces.repository');
const ApiError = require('../../utils/ApiErroir');

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VISIBILITIES = new Set(['private', 'invite-only']);
const TEAM_SIZES = new Set(['Just me', '2–5 people', '6–10 people', '11–25 people', '26+ people']);

function validate(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw ApiError.badRequest('Request body must be a JSON object.');
  }
  const result = {};
  if (!partial || Object.hasOwn(input, 'name')) {
    if (typeof input.name !== 'string' || !input.name.trim() || input.name.trim().length > 60) {
      throw ApiError.badRequest('Workspace name must be between 1 and 60 characters.');
    }
    result.name = input.name.trim();
  }
  if (!partial || Object.hasOwn(input, 'slug')) {
    if (typeof input.slug !== 'string' || !SLUG.test(input.slug)) throw ApiError.badRequest('Workspace URL is invalid.');
    result.slug = input.slug;
  }
  for (const [key, column] of [['description', 'description'], ['teamSize', 'teamSize']]) {
    if (!Object.hasOwn(input, key)) continue;
    const value = input[key];
    if (key === 'description') {
      if (value !== null && (typeof value !== 'string' || value.length > 180)) throw ApiError.badRequest('Description is invalid.');
    } else if (value !== null && !TEAM_SIZES.has(value)) {
      throw ApiError.badRequest('Choose a valid team size.');
    }
    result[column] = value;
  }
  if (Object.hasOwn(input, 'visibility')) {
    if (!VISIBILITIES.has(input.visibility)) throw ApiError.badRequest('Choose a valid workspace visibility.');
    result.visibility = input.visibility;
  } else if (!partial) {
    result.visibility = 'private';
  }
  if (Object.hasOwn(input, 'memberInvites')) {
    if (typeof input.memberInvites !== 'boolean') throw ApiError.badRequest('Member invitation permission must be true or false.');
    result.memberInvites = input.memberInvites ? 1 : 0;
  } else if (!partial) {
    result.memberInvites = 1;
  }
  return result;
}

async function get(userId, workspaceId) {
  const workspace = await repository.get(userId, workspaceId);
  if (!workspace || workspace.archived_at) throw ApiError.notFound('Workspace not found.');
  return workspace;
}

async function update(userId, workspaceId, input) {
  const workspace = await get(userId, workspaceId);
  if (!['owner', 'admin'].includes(workspace.role)) throw ApiError.forbidden('Workspace administrator permission is required.');
  const values = validate(input, true);
  if (Object.keys(values).length === 0) throw ApiError.badRequest('No valid workspace changes were provided.');
  await repository.update(workspaceId, values);
  return get(userId, workspaceId);
}

module.exports = {
  validate,
  list: (userId) => repository.list(userId),
  get,
  create: async (userId, input) => repository.create(userId, validate(input)),
  update,
  archive: async (userId, id) => {
    const workspace = await get(userId, id);
    if (!['owner', 'admin'].includes(workspace.role)) throw ApiError.forbidden();
    await repository.setArchived(id, true);
  },
  restore: async (userId, id) => {
    const workspace = await repository.get(userId, id);
    if (!workspace) throw ApiError.notFound('Workspace not found.');
    if (!['owner', 'admin'].includes(workspace.role)) throw ApiError.forbidden();
    await repository.setArchived(id, false);
  },
  remove: async (userId, id) => {
    const workspace = await get(userId, id);
    if (workspace.role !== 'owner') throw ApiError.forbidden('Only a workspace owner can delete it.');
    await repository.remove(id);
  },
  members: async (userId, id) => {
    await get(userId, id);
    return repository.members(id);
  },
};