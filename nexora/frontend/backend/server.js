const app = require('./app');
const env = require('./config/env');
const logger = require('./config/logger');
const { getPool, closePool } = require('./database/pools');

async function startServer() {
  await getPool().query('SELECT 1');
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(env.port, () => resolve(listener));
    listener.once('error', reject);
  });

  logger.info('Nexora backend is listening.', { port: env.port, environment: env.nodeEnv });
  let shuttingDown = false;
  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('Shutting down backend.', { signal });
    server.close(async (error) => {
      if (error) {
        logger.error('HTTP server shutdown failed.', { message: error.message });
        process.exitCode = 1;
      }
      try {
        await closePool();
      } catch (poolError) {
        logger.error('Database pool shutdown failed.', { message: poolError.message });
        process.exitCode = 1;
      }
    });
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  return server;
}

if (require.main === module) {
  startServer().catch(async (error) => {
    logger.error('Backend startup failed.', { message: error.message });
    try {
      await closePool();
    } catch (poolError) {
      logger.error('Database pool cleanup failed.', { message: poolError.message });
    }
    process.exitCode = 1;
  });
}

module.exports = { startServer };
