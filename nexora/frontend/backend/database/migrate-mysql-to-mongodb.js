const { createHash } = require('node:crypto');
const mysql = require('mysql2/promise');
const databaseConfig = require('../config/database');
const { connectMongo, closeMongo } = require('./mongo');
const logger = require('../config/logger');

const TABLES = [
  'users',
  'sessions',
  'workspaces',
  'workspace_members',
  'workspace_invitations',
  'projects',
  'project_members',
  'tasks',
  'task_labels',
  'subtasks',
  'notes',
  'documents',
  'comments',
  'activity_logs',
  'notifications',
  'notification_preferences',
  'ai_conversations',
  'ai_messages',
  'password_reset_tokens',
  'audit_events',
  'stored_files',
];
const BATCH_SIZE = 500;

function documentId(table, row) {
  if (row.id !== undefined && row.id !== null) return `${row.id}`;
  if (row.user_id !== undefined && row.user_id !== null) return `${row.user_id}`;
  const digest = createHash('sha256').update(JSON.stringify(row)).digest('hex');
  return `${table}:${digest}`;
}

async function migrateMySqlToMongo(sourceConnection, targetDatabase) {
  let migrated = 0;
  for (const table of TABLES) {
    const [[countRow]] = await sourceConnection.query(`SELECT COUNT(*) AS total FROM \`${table}\``);
    const total = Number(countRow.total);
    if (!Number.isSafeInteger(total) || total < 0) throw new Error(`MySQL returned an invalid row count for ${table}.`);
    let tableMigrated = 0;

    for (let offset = 0; offset < total; offset += BATCH_SIZE) {
      const [rows] = await sourceConnection.query(
        `SELECT * FROM \`${table}\` LIMIT ? OFFSET ?`,
        [BATCH_SIZE, offset],
      );
      if (rows.length === 0) break;
      const operations = rows.map((row) => {
        const id = documentId(table, row);
        return {
          updateOne: {
            filter: { _id: id },
            update: { $setOnInsert: { ...row, _id: id } },
            upsert: true,
          },
        };
      });
      await targetDatabase.collection(table).bulkWrite(operations, { ordered: true });
      tableMigrated += rows.length;
    }

    migrated += tableMigrated;
    if (tableMigrated) logger.info('Migrated MySQL table to MongoDB.', { table, rows: tableMigrated });
  }
  return { tables: TABLES.length, records: migrated };
}

async function runTransfer() {
  let sourceConnection;
  try {
    sourceConnection = await mysql.createConnection(databaseConfig);
    const targetDatabase = await connectMongo();
    const result = await migrateMySqlToMongo(sourceConnection, targetDatabase);
    logger.info('MySQL-to-MongoDB data transfer complete.', result);
  } finally {
    if (sourceConnection) await sourceConnection.end();
    await closeMongo();
  }
}

if (require.main === module) {
  runTransfer().catch((error) => {
    logger.error('MySQL-to-MongoDB data transfer failed.', { message: error.message });
    process.exitCode = 1;
  });
}

module.exports = { TABLES, BATCH_SIZE, documentId, migrateMySqlToMongo, runTransfer };
