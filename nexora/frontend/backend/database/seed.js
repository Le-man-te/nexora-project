const { randomUUID, scryptSync, randomBytes } = require('node:crypto');
const { getPool, closePool } = require('./pools');
const { withTransaction } = require('./transaction');
const logger = require('../config/logger');

async function seedDatabase(pool = getPool()) {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || 'Nexora Admin';

  if (!email && !password) {
    logger.info('Seed skipped; set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create an initial account.');
    return { seeded: false };
  }
  if (!email || !password || password.length < 12) {
    throw new Error('Set both SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD; the password must be at least 12 characters.');
  }

  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  const userId = randomUUID();
  const workspaceId = randomUUID();

  await withTransaction(pool, async (connection) => {
    await connection.execute(
      `INSERT INTO users (id, name, email, password_hash, email_verified_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash)`,
      [userId, name, email, `${salt}:${hash}`],
    );

    const [users] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    const existingUserId = users[0].id;
    const [memberships] = await connection.execute(
      'SELECT workspace_id FROM workspace_members WHERE user_id = ? ORDER BY created_at LIMIT 1',
      [existingUserId],
    );
    if (memberships.length === 0) {
      await connection.execute(
        `INSERT INTO workspaces (id, name, slug, created_by)
         VALUES (?, 'Nexora Workspace', ?, ?)`,
        [workspaceId, `nexora-${workspaceId.slice(0, 8)}`, existingUserId],
      );
      await connection.execute(
        `INSERT INTO workspace_members (id, workspace_id, user_id, role)
         VALUES (?, ?, ?, 'owner')`,
        [randomUUID(), workspaceId, existingUserId],
      );
    }
  });

  logger.info('Initial administrator account is ready.', { email });
  return { seeded: true, email };
}

if (require.main === module) {
  seedDatabase()
    .catch((error) => {
      logger.error('Database seed failed.', { message: error.message });
      process.exitCode = 1;
    })
    .finally(closePool);
}

module.exports = { seedDatabase };