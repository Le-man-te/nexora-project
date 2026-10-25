const fs = require('node:fs/promises');
const path = require('node:path');
const { getPool, closePool } = require('./pools');
const logger = require('../config/logger');

const MIGRATIONS_DIRECTORY = path.join(__dirname, 'migrations');

async function getMigrationFiles() {
  const names = await fs.readdir(MIGRATIONS_DIRECTORY);
  return names
    .filter((name) => /^\d{3}_[a-z0-9_.-]+\.sql$/i.test(name))
    .sort((left, right) => left.localeCompare(right, 'en'));
}

async function runMigrations(pool = getPool()) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) NOT NULL PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  const [appliedRows] = await pool.query('SELECT name FROM schema_migrations');
  const applied = new Set(appliedRows.map((row) => row.name));
  const names = await getMigrationFiles();
  let count = 0;

  for (const name of names) {
    if (applied.has(name)) continue;
    const sql = (await fs.readFile(path.join(MIGRATIONS_DIRECTORY, name), 'utf8')).trim();
    if (!sql) throw new Error(`Migration ${name} is empty.`);

    await pool.query(sql);
    await pool.execute('INSERT INTO schema_migrations (name) VALUES (?)', [name]);
    logger.info('Applied database migration.', { name });
    count += 1;
  }

  return { applied: count, total: names.length };
}

if (require.main === module) {
  runMigrations()
    .then((result) => logger.info('Database migrations complete.', result))
    .catch((error) => {
      logger.error('Database migrations failed.', { message: error.message });
      process.exitCode = 1;
    })
    .finally(closePool);
}

module.exports = { getMigrationFiles, runMigrations };