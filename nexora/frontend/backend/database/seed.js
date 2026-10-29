const { randomUUID, scryptSync, randomBytes } = require('node:crypto');
const { connectMongo, getMongoDatabase, closeMongo } = require('./mongo');
const logger = require('../config/logger');

async function seedDatabase(database) {
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
  const now = new Date();
  const targetDatabase = database || getMongoDatabase();
  await targetDatabase.collection('users').updateOne(
    { email },
    {
      $set: { name, password_hash: `${salt}:${hash}`, global_role: 'platform_admin', updated_at: now },
      $setOnInsert: {
        id: randomUUID(),
        email,
        email_verified_at: now,
        created_at: now,
        avatar_url: null,
      },
    },
    { upsert: true },
  );

  const user = await targetDatabase.collection('users').findOne({ email }, { projection: { id: 1 } });
  const membership = await targetDatabase.collection('workspace_members').findOne(
    { user_id: user.id },
    { projection: { id: 1 } },
  );
  if (!membership) {
    const workspaceId = randomUUID();
    await targetDatabase.collection('workspaces').insertOne({
      id: workspaceId,
      name: 'Nexora Workspace',
      slug: `nexora-${workspaceId.slice(0, 8)}`,
      description: null,
      team_size: null,
      visibility: 'private',
      member_invites: true,
      created_by: user.id,
      archived_at: null,
      created_at: now,
      updated_at: now,
    });
    try {
      await targetDatabase.collection('workspace_members').insertOne({
        id: randomUUID(),
        workspace_id: workspaceId,
        user_id: user.id,
        role: 'owner',
        created_at: now,
      });
    } catch (error) {
      await targetDatabase.collection('workspaces').deleteOne({ id: workspaceId });
      throw error;
    }
  }

  logger.info('Initial administrator account is ready.', { email });
  return { seeded: true, email };
}

if (require.main === module) {
  connectMongo()
    .then(() => seedDatabase())
    .catch((error) => {
      logger.error('MongoDB seed failed.', { message: error.message });
      process.exitCode = 1;
    })
    .finally(closeMongo);
}

module.exports = { seedDatabase };
