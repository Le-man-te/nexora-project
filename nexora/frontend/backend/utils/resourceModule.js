const { randomUUID } = require('node:crypto');
const { getPool } = require('../database/pools');
const ApiError = require('./ApiErroir');
const { parsePagination } = require('./pagination');

function assertIdentifier(value) {
  if (typeof value !== 'string' || !/^[a-z][a-z0-9_]*$/i.test(value)) {
    throw new TypeError(`Unsafe SQL identifier: ${value}`);
  }
}

function createResourceRepository(config, poolProvider = getPool) {
  assertIdentifier(config.table);
  assertIdentifier(config.idColumn || 'id');
  for (const field of Object.values(config.fields)) assertIdentifier(field.column);

  const table = `\`${config.table}\``;
  const idColumn = `\`${config.idColumn || 'id'}\``;
  const scopeSql = config.scopeSql;
  if (typeof scopeSql !== 'string' || !scopeSql.includes('?')) {
    throw new TypeError('Resource scopeSql must be a static SQL predicate containing a user placeholder.');
  }
  const scopeValues = (userId) => [userId];

  async function list(userId, query = {}) {
    const { limit, offset } = parsePagination(query);
    const pool = poolProvider();
    const orderBy = config.orderBy || 'created_at';
    assertIdentifier(orderBy);
    const [rows] = await pool.execute(
      `SELECT r.* FROM ${table} r WHERE (${scopeSql}) ORDER BY r.\`${orderBy}\` DESC LIMIT ? OFFSET ?`,
      [...scopeValues(userId), limit, offset],
    );
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM ${table} r WHERE (${scopeSql})`,
      scopeValues(userId),
    );
    return { items: rows, total: Number(countRows[0].total) };
  }

  async function getById(userId, id) {
    const [rows] = await poolProvider().execute(
      `SELECT r.* FROM ${table} r WHERE r.${idColumn} = ? AND (${scopeSql}) LIMIT 1`,
      [id, ...scopeValues(userId)],
    );
    return rows[0] || null;
  }

  async function create(userId, values) {
    if (config.authorizeCreate) await config.authorizeCreate(userId, values, poolProvider());
    const id = randomUUID();
    const record = { [config.idColumn || 'id']: id };
    if (config.createdByColumn) record[config.createdByColumn] = userId;
    if (config.ownerColumn) record[config.ownerColumn] = userId;
    for (const key of config.createFields) {
      const column = config.fields[key].column;
      if (Object.hasOwn(values, key)) record[column] = values[key];
    }
    const columns = Object.keys(record);
    for (const column of columns) assertIdentifier(column);
    const placeholders = columns.map(() => '?').join(', ');
    await poolProvider().execute(
      `INSERT INTO ${table} (${columns.map((column) => `\`${column}\``).join(', ')}) VALUES (${placeholders})`,
      columns.map((column) => record[column]),
    );
    return getById(userId, id);
  }

  async function update(userId, id, values) {
    const updates = [];
    const parameters = [];
    for (const key of config.updateFields) {
      if (!Object.hasOwn(values, key)) continue;
      const column = config.fields[key].column;
      updates.push(`\`${column}\` = ?`);
      parameters.push(values[key]);
    }
    if (updates.length === 0) throw ApiError.badRequest('No valid changes were provided.');
    const [result] = await poolProvider().execute(
      `UPDATE ${table} r SET ${updates.join(', ')} WHERE r.${idColumn} = ? AND (${scopeSql})`,
      [...parameters, id, ...scopeValues(userId)],
    );
    return result.affectedRows ? getById(userId, id) : null;
  }

  async function remove(userId, id) {
    const [result] = await poolProvider().execute(
      `DELETE r FROM ${table} r WHERE r.${idColumn} = ? AND (${scopeSql})`,
      [id, ...scopeValues(userId)],
    );
    return result.affectedRows > 0;
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
