const mysql = require('mysql2/promise');
const databaseConfig = require('../config/database');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...databaseConfig,
      waitForConnections: true,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });
  }
  return pool;
}

async function closePool() {
  if (!pool) return;
  const currentPool = pool;
  pool = undefined;
  await currentPool.end();
}

module.exports = { getPool, closePool };