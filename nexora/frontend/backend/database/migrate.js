const { connectMongo, closeMongo } = require('./mongo');
const { runMigrations } = require('./migrations/run');
const logger = require('../config/logger');

if (require.main === module) {
  connectMongo()
    .then((database) => runMigrations(database))
    .then((result) => logger.info('MongoDB migrations complete.', result))
    .catch((error) => {
      logger.error('MongoDB migrations failed.', { message: error.message });
      process.exitCode = 1;
    })
    .finally(closeMongo);
}

module.exports = { runMigrations };
