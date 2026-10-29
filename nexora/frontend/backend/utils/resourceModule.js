const { randomUUID } = require('node:crypto');
const { getMongoDatabase } = require('../database/mongo');
const ApiError = require('./ApiErroir');
const { parsePagination } = require('./pagination');

function createResourceRepository(config, databaseProvider = getMongoDatabase) {
  if (!/^[a-z][a-z0-9_]*$/i.test(config.table)) {
    throw new TypeError(`Unsafe MongoDB collection name: ${config.table}`);
  }
  if (typeof config.scopeQuery !== 'function') {
    throw new TypeError('Resource scopeQuery must be a function that returns a MongoDB filter.');
  }
  for (const field of Object.values(config.fields)) {
    if (!/^[a-z][a-z0-9_]*$/i.test(field.column)) {
      throw new TypeError(`Unsafe MongoDB field name: ${field.column}`);
    }
  }

  async function list(userId, query = {}) {
    const { limit, offset } = parsePagination(query);
    const database = databaseProvider();
    const filter = await config.scopeQuery(userId, database);
    const [items, total] = await Promise.all([
      database.collection(config.table)
        .find(filter)
        .project({ _id: 0 })
        .sort({ [config.orderBy || 'created_at']: -1 })
        .skip(offset)
        .limit(limit)
        .toArray(),
      database.collection(config.table).countDocuments(filter),
    ]);
    return { items, total };
  }

  async function getById(userId, id) {
    const database = databaseProvider();
    const filter = await config.scopeQuery(userId, database);
    return database.collection(config.table).findOne(
      { ...filter, [config.idColumn || 'id']: id },
      { projection: { _id: 0 } },
    );
  }

  async function create(userId, values) {
    const database = databaseProvider();
    if (config.authorizeCreate) await config.authorizeCreate(userId, values, database);
    const id = randomUUID();
    const now = new Date();
    const record = { [config.idColumn || 'id']: id, created_at: now, updated_at: now };
    if (config.createdByColumn) record[config.createdByColumn] = userId;
    if (config.ownerColumn) record[config.ownerColumn] = userId;
    for (const key of config.createFields) {
      const column = config.fields[key].column;
      if (Object.hasOwn(values, key)) record[column] = values[key];
    }
    if (config.fields) {
      for (const [key, spec] of Object.entries(config.fields)) {
        if (spec.type === 'boolean' && Object.hasOwn(record, spec.column)) {
          record[spec.column] = Boolean(record[spec.column]);
        }
      }
    }
    await database.collection(config.table).insertOne(record);
    return getById(userId, id);
  }

  async function update(userId, id, values) {
    const updates = {};
    for (const key of config.updateFields) {
      if (!Object.hasOwn(values, key)) continue;
      const column = config.fields[key].column;
      updates[column] = config.fields[key].type === 'boolean' ? Boolean(values[key]) : values[key];
    }
    if (Object.keys(updates).length === 0) throw ApiError.badRequest('No valid changes were provided.');
    updates.updated_at = new Date();
    const database = databaseProvider();
    const filter = await config.scopeQuery(userId, database);
    const result = await database.collection(config.table).updateOne(
      { ...filter, [config.idColumn || 'id']: id },
      { $set: updates },
    );
    return result.matchedCount ? getById(userId, id) : null;
  }

  async function remove(userId, id) {
    const database = databaseProvider();
    const filter = await config.scopeQuery(userId, database);
    const result = await database.collection(config.table).deleteOne(
      { ...filter, [config.idColumn || 'id']: id },
    );
    return result.deletedCount > 0;
  }

  return Object.freeze({ ...config, list, getById, create, update, remove });
}

function createResourceService(repository, config) {
  function validate(input, mode) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw ApiError.badRequest('Request body must be a JSON object.');
    }
    const allowed = mode === 'create' ? config.createFields : config.updateFields;
    const values = {};
    for (const key of allowed) {
      if (!Object.hasOwn(input, key)) continue;
      const spec = config.fields[key];
      const value = input[key];
      if (value === null && spec.nullable) {
        values[key] = null;
        continue;
      }
      if (spec.type === 'string') {
        if (typeof value !== 'string' || !value.trim() || value.length > (spec.maxLength || 2000)) {
          throw ApiError.badRequest(`${spec.label || key} is invalid.`);
        }
        if (spec.url) {
          let parsed;
          try {
            parsed = new URL(value);
          } catch {
            throw ApiError.badRequest(`${spec.label || key} is invalid.`);
          }
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw ApiError.badRequest(`${spec.label || key} is invalid.`);
          }
        }
        values[key] = value.trim();
      } else if (spec.type === 'enum') {
        if (!spec.values.includes(value)) throw ApiError.badRequest(`${spec.label || key} is invalid.`);
        values[key] = value;
      } else if (spec.type === 'boolean') {
        if (typeof value !== 'boolean') throw ApiError.badRequest(`${spec.label || key} must be true or false.`);
        values[key] = value ? 1 : 0;
      } else if (spec.type === 'integer') {
        if (!Number.isSafeInteger(value)) throw ApiError.badRequest(`${spec.label || key} must be an integer.`);
        values[key] = value;
      } else if (spec.type === 'date') {
        if (value !== null && (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))) {
          throw ApiError.badRequest(`${spec.label || key} must use YYYY-MM-DD format.`);
        }
        values[key] = value;
      }
    }
    if (mode === 'create') {
      for (const key of config.requiredFields) {
        if (!Object.hasOwn(values, key)) throw ApiError.badRequest(`${config.fields[key].label || key} is required.`);
      }
    }
    return values;
  }

  async function get(userId, id) {
    const value = await repository.getById(userId, id);
    if (!value) throw ApiError.notFound(`${config.singular} not found.`);
    return value;
  }

  return Object.freeze({
    ...config,
    list: (userId, query) => repository.list(userId, query),
    get,
    validate,
    create: async (userId, input) => repository.create(userId, validate(input, 'create')),
    update: async (userId, id, input) => {
      const updated = await repository.update(userId, id, validate(input, 'update'));
      if (!updated) throw ApiError.notFound(`${config.singular} not found.`);
      return updated;
    },
    remove: async (userId, id) => {
      if (!(await repository.remove(userId, id))) throw ApiError.notFound(`${config.singular} not found.`);
    },
  });
}

function createResourceController(service, config) {
  return Object.freeze({
    list: async (req, res) => {
      const result = await service.list(req.user.id, req.query);
      res.json({ [config.plural]: result.items, total: result.total });
    },
    get: async (req, res) => {
      res.json({ [config.singular]: await service.get(req.user.id, req.params.id) });
    },
    create: async (req, res) => {
      res.status(201).json({
        [config.singular]: await service.create(req.user.id, req.body),
        message: `${config.singular} created successfully.`,
      });
    },
    update: async (req, res) => {
      res.json({
        [config.singular]: await service.update(req.user.id, req.params.id, req.body),
        message: `${config.singular} updated successfully.`,
      });
    },
    remove: async (req, res) => {
      await service.remove(req.user.id, req.params.id);
      res.json({ message: `${config.singular} deleted successfully.` });
    },
  });
}

function createResourceRouter(express, controller, requireAuth, asyncHandler) {
  const router = express.Router();
  router.use(requireAuth);
  router.get('/', asyncHandler(controller.list));
  router.post('/', asyncHandler(controller.create));
  router.get('/:id', asyncHandler(controller.get));
  router.patch('/:id', asyncHandler(controller.update));
  router.delete('/:id', asyncHandler(controller.remove));
  return router;
}

module.exports = {
  createResourceRepository,
  createResourceService,
  createResourceController,
  createResourceRouter,
};
