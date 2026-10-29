const { connectMongo, closeMongo } = require('./mongo');
const logger = require('../config/logger');

async function checkMongo() {
  try {
    const database = await connectMongo();
    await database.command({ ping: 1 });
    logger.info('MongoDB connection is ready.', { database: database.databaseName });
  } finally {
    await closeMongo();
  }
}

if (require.main === module) {
  checkMongo().catch((error) => {
    logger.error('MongoDB connection check failed.', { message: error.message });
    process.exitCode = 1;
  });
}

module.exports = { checkMongo };
