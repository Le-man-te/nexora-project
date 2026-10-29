const fs = require('node:fs/promises');
const path = require('node:path');
const logger = require('../../config/logger');

const MIGRATIONS_DIRECTORY = __dirname;

async function getMigrationFiles() {
  const entries = await fs.readdir(MIGRATIONS_DIRECTORY);
  return entries
    .filter((name) => /^\d{3}_[a-z0-9_-]+\.js$/i.test(name))
    .sort((left, right) => left.localeCompare(right, 'en'));
}

async function runMigrations(database) {
  if (!database || typeof database.collection !== 'function') {
    throw new TypeError('A connected MongoDB database is required to run migrations.');
  }

  const migrationCollection = database.collection('_migrations');
  const files = await getMigrationFiles();
  let applied = 0;

  for (const file of files) {
    const existing = await migrationCollection.findOne({ _id: file });
    if (existing) continue;

    const migration = require(path.join(MIGRATIONS_DIRECTORY, file));
    if (!/^[a-z][a-z0-9_]*$/i.test(migration.collection)) {
      throw new TypeError(`Migration ${file} has an invalid collection name.`);
    }

    const idField = migration.idField || 'id';
    const indexes = [
      [{ [idField]: 1 }, { unique: true }],
      ...migration.indexes,
    ];
    await database.collection(migration.collection).createIndexes(
      indexes.map(([key, options]) => ({ key, ...options })),
    );
    await migrationCollection.insertOne({ _id: file, applied_at: new Date() });
    logger.info('Applied MongoDB migration.', { name: file, collection: migration.collection });
    applied += 1;
  }

  return { applied, total: files.length, database: database.databaseName };
}

module.exports = { getMigrationFiles, runMigrations };
